/**
 * Makes the site's icons from the logo.
 *
 *   npm run icons     rebuild them from public/assets/logo/logo.svg
 *
 * Writes, at the root of the site:
 *
 *   favicon.ico            16, 32 and 48px, the file browsers and Google ask
 *                          for by name whether or not the markup mentions it
 *   icon-192.png           what the markup points at
 *   apple-touch-icon.png   180px, for an iOS home screen
 *
 * Two things make this worth generating rather than linking the logo directly.
 * The logo is a traced SVG of about a megabyte, which is a great deal to ask
 * for a 16px square and more than some crawlers will take. And nothing used to
 * answer at /favicon.ico, so the catch-all rewrite handed that request the
 * index page: a crawler looking for an icon received HTML, with a 200 on it.
 *
 * Google wants a square whose size is a multiple of 48, which is why those are
 * the sizes here.
 */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const SRC = 'public/assets/logo/logo.svg';
const OUT = 'public';
const ICO_SIZES = [16, 32, 48];

const render = (size) =>
  sharp(SRC, { density: 384 })
    .resize(size, size, { fit: 'contain' })
    .flatten({ background: '#ffffff' }) // an icon has no business being see-through
    .png({ compressionLevel: 9 })
    .toBuffer();

/**
 * An .ico is a short header, one 16-byte record per size, then the images
 * themselves. Every size here is stored as a PNG, which the format has allowed
 * since Windows Vista and every browser in use understands.
 */
function ico(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // 1 = icon
  header.writeUInt16LE(images.length, 4);

  let offset = 6 + images.length * 16;
  const entries = images.map(({ size, data }) => {
    const e = Buffer.alloc(16);
    e.writeUInt8(size === 256 ? 0 : size, 0); // 0 stands for 256
    e.writeUInt8(size === 256 ? 0 : size, 1);
    e.writeUInt8(0, 2); // colours in palette: none, it is truecolour
    e.writeUInt8(0, 3); // reserved
    e.writeUInt16LE(1, 4); // colour planes
    e.writeUInt16LE(32, 6); // bits per pixel
    e.writeUInt32LE(data.length, 8);
    e.writeUInt32LE(offset, 12);
    offset += data.length;
    return e;
  });

  return Buffer.concat([header, ...entries, ...images.map((i) => i.data)]);
}

const sizes = await Promise.all(ICO_SIZES.map(async (size) => ({ size, data: await render(size) })));
fs.writeFileSync(path.join(OUT, 'favicon.ico'), ico(sizes));
console.log(`\nfavicon.ico        ${ICO_SIZES.join(', ')}px`);

for (const [name, size] of [['icon-192.png', 192], ['apple-touch-icon.png', 180]]) {
  const data = await render(size);
  fs.writeFileSync(path.join(OUT, name), data);
  console.log(`${name.padEnd(19)}${size}px, ${(data.length / 1024).toFixed(1)} kB`);
}
console.log();
