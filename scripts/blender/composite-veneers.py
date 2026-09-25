"""
Puts veneer sheets onto the rendered room passes. No rendering happens here.

Run through Blender's Python (it bundles numpy, OpenImageIO and OpenColorIO):
    blender -b --factory-startup --python composite-veneers.py -- --jobs jobs.json

jobs.json:
    {
      "passes": "<dir written by render-room-passes.py>",
      "out":    "<dir for PNGs>",
      "jobs":   [{ "name": "ATHENS AMERICANO", "sheet": "<path to hi-res sheet>" }, ...]
    }

For each camera and veneer:
    D      = (render_hi - render_lo) / (albedo_hi - albedo_lo)   light per unit wall colour
    colour = the sheet, sampled with the wall_uv the Mapping node produced
    final  = render_lo + (colour - albedo_lo) * D

On the wall, colour is the sheet texel under that pixel. Everywhere else it is
the sheet's average colour, which carries the veneer's tint into light bounced
onto the floor, ceiling and glossy objects. The result then goes through the
same view transform and exposure as the .blend (AgX, -2 EV).

Writes <out>/<name>/<camera>.png (8-bit sRGB).
"""
import argparse
import json
import os
import sys

import bpy
import numpy as np
import OpenImageIO as oiio
import PyOpenColorIO as ocio


# ---------------------------------------------------------------- io ----
def read_passes(path):
    """{pass name: float32 HxWxC} from a multi-part Blender EXR."""
    inp = oiio.ImageInput.open(path)
    if inp is None:
        raise SystemExit(f"Cannot open {path}: {oiio.geterror()}")
    parts = {}
    i = 0
    while inp.seek_subimage(i, 0):
        spec = inp.spec()
        name = spec.getattribute("name") or spec.channelnames[0].rsplit(".", 1)[0]
        parts[name.split(".", 1)[-1]] = inp.read_image(i, 0, 0, spec.nchannels, oiio.FLOAT)
        i += 1
    inp.close()
    return parts


def read_sheet(path):
    """Sheet as linear float RGB, EXIF orientation applied."""
    buf = oiio.ImageBufAlgo.reorient(oiio.ImageBuf(path))
    px = buf.get_pixels(oiio.FLOAT)[:, :, :3]
    return np.where(px <= 0.04045, px / 12.92, ((px + 0.055) / 1.055) ** 2.4).astype(np.float32)


def write_png(path, rgb8):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    h, w, _ = rgb8.shape
    out = oiio.ImageOutput.create(path)
    out.open(path, oiio.ImageSpec(w, h, 3, oiio.UINT8))
    out.write_image(rgb8)
    out.close()


# ----------------------------------------------------------- texture ----
def mip_pyramid(img):
    """Box-filtered levels down to about 1 px, like a GPU mip chain."""
    levels = [img]
    while min(levels[-1].shape[:2]) > 1:
        a = levels[-1]
        h, w = (a.shape[0] // 2) * 2, (a.shape[1] // 2) * 2
        a = a[:h, :w]
        levels.append(0.25 * (a[0::2, 0::2] + a[1::2, 0::2] + a[0::2, 1::2] + a[1::2, 1::2]))
    return levels


def sample_bilinear(level, u, v):
    """Blender image texture lookup: origin bottom-left, Repeat extension."""
    h, w = level.shape[:2]
    x = u * w - 0.5
    y = (1.0 - v) * h - 0.5
    x0 = np.floor(x)
    y0 = np.floor(y)
    fx = (x - x0)[:, None]
    fy = (y - y0)[:, None]
    x0 = x0.astype(np.int64) % w
    y0 = y0.astype(np.int64) % h
    x1 = (x0 + 1) % w
    y1 = (y0 + 1) % h
    top = level[y0, x0] * (1 - fx) + level[y0, x1] * fx
    bottom = level[y1, x0] * (1 - fx) + level[y1, x1] * fx
    return top * (1 - fy) + bottom * fy


def sample_trilinear(levels, u, v, footprint):
    """Pick mip levels from each pixel's footprint in texels, blend between them."""
    lod = np.clip(np.log2(np.maximum(footprint, 1.0)), 0, len(levels) - 1)
    l0 = np.floor(lod).astype(np.int64)
    t = (lod - l0)[:, None]
    out = np.empty((u.size, 3), np.float32)
    for level in np.unique(l0):
        sel = l0 == level
        a = sample_bilinear(levels[level], u[sel], v[sel])
        b = sample_bilinear(levels[min(level + 1, len(levels) - 1)], u[sel], v[sel])
        out[sel] = a * (1 - t[sel]) + b * t[sel]
    return out


# ------------------------------------------------------------ camera ----
class CameraPasses:
    def __init__(self, directory, name, manifest):
        lo = read_passes(os.path.join(directory, f"{name}.lo.exr"))
        hi = read_passes(os.path.join(directory, f"{name}.hi.exr"))
        a_lo, a_hi = manifest["albedoLo"], manifest["albedoHi"]
        self.name = name
        self.albedo_lo = a_lo
        self.base = lo["Combined"][:, :, :3]
        self.light = (hi["Combined"][:, :, :3] - self.base) / (a_hi - a_lo)

        mask = np.clip(lo["wall_mask"][:, :, 0], 0.0, 1.0)
        # AOVs are averaged with zeros where the wall only partly covers a pixel.
        uv = lo["wall_uv"][:, :, :2] / np.maximum(mask, 1e-4)[:, :, None]
        self.mask = mask
        self.wall = np.nonzero(mask > 1e-3)
        self.u = uv[:, :, 0][self.wall]
        self.v = uv[:, :, 1][self.wall]

        # Texture-space derivatives per screen pixel, for mip selection. They
        # spike on the wall's outline, which only softens that 1-2 px edge.
        du_dy, du_dx = np.gradient(uv[:, :, 0])
        dv_dy, dv_dx = np.gradient(uv[:, :, 1])
        self.derivs = [d[self.wall] for d in (du_dx, dv_dx, du_dy, dv_dy)]

    def composite(self, levels, mean_colour):
        h0, w0 = levels[0].shape[:2]
        du_dx, dv_dx, du_dy, dv_dy = self.derivs
        footprint = np.maximum(np.hypot(du_dx * w0, dv_dx * h0), np.hypot(du_dy * w0, dv_dy * h0))
        texels = sample_trilinear(levels, self.u, self.v, footprint)

        colour = np.broadcast_to(mean_colour, self.base.shape).copy()
        m = self.mask[self.wall][:, None]
        colour[self.wall] = m * texels + (1 - m) * mean_colour
        return np.maximum(self.base + (colour - self.albedo_lo) * self.light, 0.0)


# ------------------------------------------------------------ colour ----
def view_transform(colour_settings):
    cfg_path = os.path.join(
        os.path.dirname(bpy.app.binary_path),
        f"{bpy.app.version[0]}.{bpy.app.version[1]}",
        "datafiles", "colormanagement", "config.ocio",
    )
    config = ocio.Config.CreateFromFile(cfg_path)
    dvt = ocio.DisplayViewTransform(
        src=config.getRoleColorSpace("scene_linear"),
        display=colour_settings["display"],
        view=colour_settings["view"],
    )
    look = colour_settings.get("look") or "None"
    if look != "None":
        print(f"KAIU note: look '{look}' is not applied", flush=True)
    cpu = config.getProcessor(dvt).getDefaultCPUProcessor()
    exposure = 2.0 ** colour_settings.get("exposure", 0.0)
    gamma = colour_settings.get("gamma", 1.0)
    rng = np.random.default_rng(7)

    def apply(linear):
        img = np.ascontiguousarray(linear * exposure, dtype=np.float32)
        cpu.applyRGB(img)
        if gamma != 1.0:
            img = np.power(np.clip(img, 0, None), 1.0 / gamma)
        # Same idea as Blender's 8-bit dither: breaks up banding in soft gradients.
        img += (rng.random(img.shape, dtype=np.float32) - 0.5) / 255.0
        return (np.clip(img, 0, 1) * 255 + 0.5).astype(np.uint8)

    return apply


# -------------------------------------------------------------- main ----
def main():
    argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
    p = argparse.ArgumentParser()
    p.add_argument("--jobs", required=True)
    args = p.parse_args(argv)

    with open(args.jobs) as f:
        spec = json.load(f)
    with open(os.path.join(spec["passes"], "passes.json")) as f:
        manifest = json.load(f)

    to_display = view_transform(manifest["colour"])
    cameras = [CameraPasses(spec["passes"], c["name"], manifest) for c in manifest["cameras"]]

    for job in spec["jobs"]:
        sheet = read_sheet(job["sheet"])
        levels = mip_pyramid(sheet)
        mean_colour = sheet.reshape(-1, 3).mean(axis=0)
        for cam in cameras:
            rgb8 = to_display(cam.composite(levels, mean_colour))
            write_png(os.path.join(spec["out"], job["name"], f"{cam.name}.png"), rgb8)
        print(f"KAIU composited {job['name']}", flush=True)


main()
