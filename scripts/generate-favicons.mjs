import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promises as fs } from 'node:fs';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const publicDir = path.join(root, 'public');
const sourceSvg = path.join(publicDir, 'favicon.svg');

const pngTargets = [
  { size: 16, name: 'favicon-16x16.png' },
  { size: 32, name: 'favicon-32x32.png' },
  { size: 180, name: 'apple-touch-icon.png' },
  { size: 192, name: 'android-chrome-192x192.png' },
  { size: 512, name: 'android-chrome-512x512.png' },
];

const icoSizes = [16, 32];

async function ensureSourceExists() {
  try {
    await fs.access(sourceSvg);
  } catch (error) {
    throw new Error(`Missing favicon source SVG at ${sourceSvg}`);
  }
}

async function createPngTargets() {
  await Promise.all(
    pngTargets.map(async ({ size, name }) => {
      const targetPath = path.join(publicDir, name);
      await sharp(sourceSvg)
        .resize(size, size, { fit: 'cover' })
        .png({ compressionLevel: 9 })
        .toFile(targetPath);
      return targetPath;
    })
  );
}

function buildIco(buffers) {
  const count = buffers.length;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type ico
  header.writeUInt16LE(count, 4);

  const entries = [];
  let offset = header.length + count * 16;
  buffers.forEach((buffer, index) => {
    const size = icoSizes[index];
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size >= 256 ? 0 : size, 0);
    entry.writeUInt8(size >= 256 ? 0 : size, 1);
    entry.writeUInt8(0, 2); // color count
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // color planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(buffer.length, 8);
    entry.writeUInt32LE(offset, 12);
    offset += buffer.length;
    entries.push(entry);
  });

  return Buffer.concat([header, ...entries, ...buffers]);
}

async function createIcoFile() {
  const buffers = await Promise.all(
    icoSizes.map((size) =>
      fs.readFile(path.join(publicDir, `favicon-${size}x${size}.png`))
    )
  );
  const icoBuffer = buildIco(buffers);
  await fs.writeFile(path.join(publicDir, 'favicon.ico'), icoBuffer);
}

async function main() {
  await ensureSourceExists();
  await createPngTargets();
  await createIcoFile();
  console.log('Favicon assets refreshed.');
}

main().catch((error) => {
  console.error('[favicons] failed to generate assets');
  console.error(error);
  process.exit(1);
});
