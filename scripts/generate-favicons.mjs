import { chromium } from 'playwright';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const svgPath = path.resolve(__dirname, '../public/favicon.svg');
const outputDir = path.resolve(__dirname, '../public');

const outputs = [
  { size: 16, name: 'favicon-16x16.png' },
  { size: 32, name: 'favicon-32x32.png' },
  { size: 48, name: 'favicon-48x48.png' },
  { size: 180, name: 'apple-touch-icon.png' },
  { size: 180, name: 'apple-touch-icon-precomposed.png' },
  { size: 192, name: 'android-chrome-192x192.png' },
  { size: 512, name: 'android-chrome-512x512.png' },
];

const svgMarkup = await readFile(svgPath, 'utf8');
const browser = await chromium.launch({ headless: true });

try {
  for (const { size, name } of outputs) {
    const page = await browser.newPage({ viewport: { width: size, height: size }, deviceScaleFactor: 1 });
    const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      * { box-sizing: border-box; }
      html, body {
        margin: 0;
        width: ${size}px;
        height: ${size}px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: transparent;
      }
      svg {
        width: ${size}px;
        height: ${size}px;
        display: block;
      }
    </style>
  </head>
  <body>
    ${svgMarkup}
  </body>
</html>`;

    await page.setContent(html, { waitUntil: 'load' });
    const outputPath = path.join(outputDir, name);
    await page.screenshot({ path: outputPath });
    await page.close();
  }
} finally {
  await browser.close();
}

console.log('Favicons generated in', outputDir);
