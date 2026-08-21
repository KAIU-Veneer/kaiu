#!/usr/bin/env python3
"""
Convert all .png files in a folder to .webp (for a lighter website).

Usage:
    python png_to_webp.py <input_folder> [-o OUTPUT_FOLDER] [-q QUALITY] [--lossless] [--keep] [--recursive]

Examples:
    python png_to_webp.py ./images
    python png_to_webp.py ./images -o ./images/webp -q 80
    python png_to_webp.py ./images --lossless --keep

Requires Pillow:
    pip install Pillow
"""

import argparse
import sys
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    print("Pillow is required. Install it with: pip install Pillow")
    sys.exit(1)


def convert_folder(input_folder: Path, output_folder: Path, quality: int,
                    lossless: bool, keep_original: bool, recursive: bool) -> None:
    pattern = "**/*.png" if recursive else "*.png"
    png_files = [f for f in input_folder.glob(pattern) if f.is_file()]

    if not png_files:
        print(f"No .png files found in {input_folder}")
        return

    output_folder.mkdir(parents=True, exist_ok=True)

    converted = 0
    failed = 0

    for png_path in png_files:
        # Preserve subfolder structure when recursive
        relative = png_path.relative_to(input_folder)
        webp_path = (output_folder / relative).with_suffix(".webp")
        webp_path.parent.mkdir(parents=True, exist_ok=True)

        try:
            with Image.open(png_path) as img:
                # Keep transparency (RGBA) if the PNG has it, otherwise RGB
                if img.mode not in ("RGB", "RGBA"):
                    img = img.convert("RGBA" if "A" in img.getbands() else "RGB")

                if lossless:
                    img.save(webp_path, "webp", lossless=True)
                else:
                    img.save(webp_path, "webp", quality=quality)

            orig_size = png_path.stat().st_size
            new_size = webp_path.stat().st_size
            savings = (1 - new_size / orig_size) * 100 if orig_size else 0
            print(f"✓ {relative} -> {webp_path.relative_to(output_folder)} "
                  f"({orig_size // 1024}KB -> {new_size // 1024}KB, {savings:.0f}% smaller)")
            converted += 1

            if not keep_original and output_folder == input_folder:
                png_path.unlink()

        except Exception as e:
            print(f"✗ Failed to convert {relative}: {e}")
            failed += 1

    print(f"\nDone. Converted: {converted}, Failed: {failed}")


def main():
    parser = argparse.ArgumentParser(description="Convert PNG images to WebP.")
    parser.add_argument("input_folder", type=str, help="Folder containing .png files")
    parser.add_argument("-o", "--output", type=str, default=None,
                         help="Output folder (default: same as input folder)")
    parser.add_argument("-q", "--quality", type=int, default=80,
                         help="WebP quality 1-100 (default: 80, ignored with --lossless)")
    parser.add_argument("--lossless", action="store_true",
                         help="Use lossless WebP (larger files, pixel-perfect - good for logos/icons/screenshots with text)")
    parser.add_argument("--keep", action="store_true",
                         help="Keep original .png files (default: delete them if output folder == input folder)")
    parser.add_argument("--recursive", action="store_true",
                         help="Also convert files in subfolders")

    args = parser.parse_args()

    input_folder = Path(args.input_folder).expanduser().resolve()
    if not input_folder.is_dir():
        print(f"Error: {input_folder} is not a valid folder")
        sys.exit(1)

    output_folder = Path(args.output).expanduser().resolve() if args.output else input_folder

    convert_folder(input_folder, output_folder, args.quality, args.lossless, args.keep, args.recursive)


if __name__ == "__main__":
    main()
