"""
Renders the passes the veneer compositor needs, once per camera.

    npm run rooms:render            (see package.json for the Blender call)

Opens the room .blend read-only in spirit: every change below lives in memory
and the file is never saved.

For each camera it renders the room twice in Cycles, with the veneer wall set
to two flat greys (ALBEDO_LO and ALBEDO_HI). Because light scales linearly with
a surface's colour, the difference between the two tells the compositor how
much light every pixel gets per unit of wall colour: the sun streak and shading
on the wall itself, plus the wall's bounce onto the floor, ceiling and glossy
objects. The low render also stores two AOVs:

    wall_uv    the texture coordinate your Mapping node feeds the veneer image,
               so sheets land exactly where they do in Blender
    wall_mask  1 where the wall is visible, 0 elsewhere (anti-aliased)

Every camera in the file is rendered.

Output (per camera, OpenEXR multilayer, scene-linear):
    <out>/<camera>.lo.exr     Combined + wall_uv + wall_mask
    <out>/<camera>.hi.exr     Combined
    <out>/passes.json         cameras, albedos, colour management settings
"""
import argparse
import json
import os
import sys
import time

import bpy

ALBEDO_LO = 0.2
ALBEDO_HI = 0.8
WALL_MATERIALS = ("KAIU_Veneer", "Material.001")


def parse_args():
    argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
    p = argparse.ArgumentParser()
    p.add_argument("--out", required=True)
    p.add_argument("--samples", type=int, default=0, help="0 = keep the file's setting")
    p.add_argument("--scale", type=int, default=100, help="resolution percentage")
    p.add_argument("--only", default="", help="comma-separated camera names to render")
    return p.parse_args(argv)


def wall_material():
    for name in WALL_MATERIALS:
        if name in bpy.data.materials:
            return bpy.data.materials[name]
    raise SystemExit(f"No wall material named {' or '.join(WALL_MATERIALS)}")


def prepare_wall(mat):
    """Swap the veneer image for a flat colour we can drive, and add the AOVs."""
    nt = mat.node_tree
    bsdf = next(n for n in nt.nodes if n.type == "BSDF_PRINCIPLED")
    image = next((n for n in nt.nodes if n.type == "TEX_IMAGE"), None)
    if image is None or not image.inputs["Vector"].is_linked:
        raise SystemExit("Wall material needs an Image Texture fed by a Mapping/UV vector")
    uv_source = image.inputs["Vector"].links[0].from_socket

    for link in list(bsdf.inputs["Base Color"].links):
        nt.links.remove(link)
    albedo = nt.nodes.new("ShaderNodeRGB")
    albedo.name = "KAIU_Albedo"
    nt.links.new(albedo.outputs["Color"], bsdf.inputs["Base Color"])

    aov_uv = nt.nodes.new("ShaderNodeOutputAOV")
    aov_uv.aov_name = "wall_uv"
    nt.links.new(uv_source, aov_uv.inputs["Color"])

    aov_mask = nt.nodes.new("ShaderNodeOutputAOV")
    aov_mask.aov_name = "wall_mask"
    aov_mask.inputs["Value"].default_value = 1.0

    layer = bpy.context.view_layer
    for name, kind in (("wall_uv", "COLOR"), ("wall_mask", "VALUE")):
        if name not in [a.name for a in layer.aovs]:
            aov = layer.aovs.add()
            aov.name = name
            aov.type = kind
    return albedo


def set_albedo(node, value):
    node.outputs["Color"].default_value = (value, value, value, 1.0)


def configure_output(scene, args):
    scene.render.resolution_percentage = args.scale
    if args.samples:
        scene.cycles.samples = args.samples
    s = scene.render.image_settings
    if hasattr(s, "media_type"):  # Blender 5.x splits the media type out first
        s.media_type = "MULTI_LAYER_IMAGE"
    s.file_format = "OPEN_EXR_MULTILAYER"
    s.color_depth = "16"
    s.exr_codec = "ZIP"


def render_to(scene, path):
    scene.render.filepath = path
    t = time.time()
    bpy.ops.render.render(write_still=True)
    return time.time() - t


def main():
    args = parse_args()
    # Blender resolves relative render paths differently from Python; pin it.
    args.out = os.path.abspath(args.out)
    os.makedirs(args.out, exist_ok=True)
    scene = bpy.context.scene
    mat = wall_material()
    albedo = prepare_wall(mat)
    configure_output(scene, args)

    only = {c.strip() for c in args.only.split(",") if c.strip()}
    cameras = sorted((o for o in bpy.data.objects if o.type == "CAMERA"), key=lambda o: o.name)
    cameras = [c for c in cameras if not only or c.name in only]

    vs = scene.view_settings
    manifest = {
        "albedoLo": ALBEDO_LO,
        "albedoHi": ALBEDO_HI,
        "resolution": [scene.render.resolution_x * args.scale // 100, scene.render.resolution_y * args.scale // 100],
        "samples": scene.cycles.samples,
        "colour": {"view": vs.view_transform, "look": vs.look, "exposure": vs.exposure, "gamma": vs.gamma,
                   "display": scene.display_settings.display_device},
        "cameras": [],
    }
    for cam in cameras:
        scene.camera = cam
        set_albedo(albedo, ALBEDO_LO)
        t_lo = render_to(scene, os.path.join(args.out, f"{cam.name}.lo.exr"))
        set_albedo(albedo, ALBEDO_HI)
        t_hi = render_to(scene, os.path.join(args.out, f"{cam.name}.hi.exr"))
        print(f"KAIU rendered {cam.name}: {t_lo:.0f}s + {t_hi:.0f}s", flush=True)
        manifest["cameras"].append({"name": cam.name})

    with open(os.path.join(args.out, "passes.json"), "w") as f:
        json.dump(manifest, f, indent=2)
    print("KAIU done", flush=True)


main()
