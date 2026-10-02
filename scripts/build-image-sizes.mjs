/**
 * Makes the smaller copies of the photographs that the pages actually display.
 *
 *   npm run images            convert the ones that are new or changed
 *   npm run images -- --force redo all of them
 *
 * The originals are kept at the size they arrived: a veneer swatch is around
 * 2160px wide because that is what the "download hi-res" link hands over for
 * veneers without a separate hi-res sheet, and the project photographs are
 * 1600px so they still look right opened large. On screen a swatch card is
 * about 260 CSS pixels and a project card about 360, so sending the original
 * costs several times the bytes it needs.
 *
 * This writes the narrower copies beside each original, in a folder named for
 * their width:
 *
 *   public/assets/image/w400/<NAME>.webp
 *   public/assets/image/w800/<NAME>.webp
 *   public/assets/projects/<project>/w800/<n>.webp
 *
 * The pages offer the original and the copies together through srcset, so a
 * browser takes the small one on an ordinary screen and a larger one on a
 * dense screen. Run it after adding a swatch or a project photograph.
 */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const QUALITY = 78;
const force = process.argv.includes('--force');
const mtime = (f) => (fs.existsSync(f) ? fs.statSync(f).mtimeMs : 0);

/** Every folder holding originals, and the widths wanted for each. */
function sources() {
  const found = [{ dir: 'public/assets/image', widths: [400, 800] }];
  const projects = 'public/assets/projects';
  if (fs.existsSync(projects)) {
    for (const entry of fs.readdirSync(projects, { withFileTypes: true })) {
      if (entry.isDirectory()) found.push({ dir: path.join(projects, entry.name), widths: [800] });
    }
  }
  return found;
}

let written = 0;
for (const { dir, widths } of sources()) {
  const originals = fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((e) => e.isFile() && /\.webp$/i.test(e.name))
    .map((e) => e.name);
  if (!originals.length) continue;

  for (const width of widths) {
    const out = path.join(dir, `w${width}`);
    fs.mkdirSync(out, { recursive: true });

    for (const name of originals) {
      const from = path.join(dir, name);
      const to = path.join(out, name);
      if (force || mtime(to) < mtime(from)) {
        await sharp(from)
          .resize({ width, withoutEnlargement: true })
          .webp({ quality: QUALITY, effort: 6 })
          .toFile(to);
        written += 1;
      }
    }
    // Drop copies whose original has gone.
    for (const name of fs.readdirSync(out)) {
      if (!originals.includes(name)) {
        fs.rmSync(path.join(out, name));
        console.log(`  removed ${out}/${name}`);
      }
    }
  }
  console.log(`${dir}: ${originals.length} original${originals.length === 1 ? '' : 's'}`);
}

console.log(`\n${written} file${written === 1 ? '' : 's'} written\n`);
