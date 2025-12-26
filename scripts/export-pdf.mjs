import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import fs from 'node:fs';
import path from 'node:path';

const PREVIEW_PORT = Number(process.env.ASTRO_PREVIEW_PORT ?? 4321);
const PREVIEW_HOST = '127.0.0.1';

const waitForServer = async (url, attempts = 40) => {
  for (let i = 0; i < attempts; i += 1) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch (error) {
      // swallow until server is ready
    }
    await delay(1000);
  }
  throw new Error('Astro preview server did not become ready in time.');
};

const run = async () => {
  const preview = spawn('npm', ['run', 'preview', '--', '--host', PREVIEW_HOST, '--port', String(PREVIEW_PORT)], {
    stdio: 'inherit',
    env: process.env,
  });

  const targetUrl = `http://${PREVIEW_HOST}:${PREVIEW_PORT}/`;
  try {
    await waitForServer(targetUrl);
    const browser = await chromium.launch();
    const page = await browser.newPage({ viewport: { width: 1280, height: 1700 } });
    await page.goto(targetUrl, { waitUntil: 'networkidle' });
    await page.emulateMedia({ media: 'print' });

    const pdfPath = path.resolve('public', 'resume.pdf');
    fs.mkdirSync(path.dirname(pdfPath), { recursive: true });
    await page.pdf({
      path: pdfPath,
      format: 'Letter',
      printBackground: true,
      margin: { top: '0.5in', bottom: '0.5in', left: '0.5in', right: '0.5in' },
    });
    await browser.close();
  } finally {
    preview.kill('SIGINT');
  }
};

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
