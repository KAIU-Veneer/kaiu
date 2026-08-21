#!/usr/bin/env python3
"""
Convert all .jpg/.jpeg files in a folder to .webp (for a lighter website).

Usage:
    python jpg_to_webp.py <input_folder> [-o OUTPUT_FOLDER] [-q QUALITY] [--keep] [--recursive]

Examples:
    python jpg_to_webp.py ./images
    python jpg_to_webp.py ./images -o ./images/webp -q 80
    python jpg_to_webp.py ./images --recursive --keep

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
                    keep_original: bool, recursive: bool) -> None:
    pattern = "**/*" if recursive else "*"
    jpg_files = [
        f for f in input_folder.glob(pattern)
        if f.is_file() and f.suffix.lower() in (".jpg", ".jpeg")
    ]

    if not jpg_files:
        print(f"No .jpg/.jpeg files found in {input_folder}")
        return

    output_folder.mkdir(parents=True, exist_ok=True)

    converted = 0
    failed = 0

    for jpg_path in jpg_files:
        # Preserve subfolder structure when recursive
        relative = jpg_path.relative_to(input_folder)
        webp_path = (output_folder / relative).with_suffix(".webp")
        webp_path.parent.mkdir(parents=True, exist_ok=True)

        try:
            with Image.open(jpg_path) as img:
                img = img.convert("RGB")  # webp doesn't need CMYK/etc weirdness
                img.save(webp_path, "webp", quality=quality)

            orig_size = jpg_path.stat().st_size
            new_size = webp_path.stat().st_size
            savings = (1 - new_size / orig_size) * 100 if orig_size else 0
            print(f"✓ {relative} -> {webp_path.relative_to(output_folder)} "
                  f"({orig_size // 1024}KB -> {new_size // 1024}KB, {savings:.0f}% smaller)")
            converted += 1

            if not keep_original and output_folder == input_folder:
                jpg_path.unlink()

        except Exception as e:
            print(f"✗ Failed to convert {relative}: {e}")
            failed += 1

    print(f"\nDone. Converted: {converted}, Failed: {failed}")


def main():
    parser = argparse.ArgumentParser(description="Convert JPG images to WebP.")
    parser.add_argument("input_folder", type=str, help="Folder containing .jpg/.jpeg files")
    parser.add_argument("-o", "--output", type=str, default=None,
                         help="Output folder (default: same as input folder)")
    parser.add_argument("-q", "--quality", type=int, default=80,
                         help="WebP quality 1-100 (default: 80)")
    parser.add_argument("--keep", action="store_true",
                         help="Keep original .jpg files (default: delete them if output folder == input folder)")
    parser.add_argument("--recursive", action="store_true",
                         help="Also convert files in subfolders")

    args = parser.parse_args()

    input_folder = Path(args.input_folder).expanduser().resolve()
    if not input_folder.is_dir():
        print(f"Error: {input_folder} is not a valid folder")
        sys.exit(1)

    output_folder = Path(args.output).expanduser().resolve() if args.output else input_folder

    convert_folder(input_folder, output_folder, args.quality, args.keep, args.recursive)


if __name__ == "__main__":
    main()
