import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import fs from 'node:fs';
import path from 'node:path';
import net from 'node:net';

const PREVIEW_PORT = Number(process.env.ASTRO_PREVIEW_PORT ?? 4321);
const PREVIEW_HOST = '127.0.0.1';

const assertAvailablePort = () => new Promise((resolve, reject) => {
  const probe = net.createServer();
  probe.once('error', (error) => reject(new Error(`PDF preview port ${PREVIEW_PORT} unavailable: ${error.code}`)));
  probe.listen(PREVIEW_PORT, PREVIEW_HOST, () => probe.close(resolve));
});

const waitForServer = async (url, previewState, attempts = 40) => {
  for (let i = 0; i < attempts; i += 1) {
    if (previewState.exited) throw new Error('Astro preview exited before PDF export.');
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
  await assertAvailablePort();
  const previewState = { exited: false };
  const preview = spawn('npm', ['run', 'preview', '--', '--host', PREVIEW_HOST, '--port', String(PREVIEW_PORT)], {
    stdio: 'inherit',
    env: process.env,
  });

  preview.once('exit', () => { previewState.exited = true; });
  preview.once('error', () => { previewState.exited = true; });

  const targetUrl = `http://${PREVIEW_HOST}:${PREVIEW_PORT}/`;
  try {
    await waitForServer(targetUrl, previewState);
    const browser = await chromium.launch();
    const page = await browser.newPage({ viewport: { width: 1280, height: 1700 } });
    await page.addInitScript(() => localStorage.setItem('ga-consent', 'denied'));
    await page.route('**/*', (route) => {
      const url = new URL(route.request().url());
      return url.hostname === PREVIEW_HOST ? route.continue() : route.abort();
    });
    await page.goto(targetUrl, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    if (previewState.exited) throw new Error('Astro preview exited before PDF capture.');
    const source = JSON.parse(fs.readFileSync(path.resolve('src/data/resume.json'), 'utf8'));
    if ((await page.locator('h1').innerText()).trim() !== source.header.name) {
      throw new Error('PDF preview does not match this repository resume source.');
    }
    await page.emulateMedia({ media: 'print' });
    // Format the existing public skill catalogue as semantic print text.
    // No facts are copied from a second source and no contact/private
    // fields are introduced.
    await page.evaluate(() => {
      const badges = document.querySelector('.skill-badges');
      if (!badges) return;
      const list = document.createElement('ul');
      list.className = 'print-skill-list';
      badges.querySelectorAll('.badge').forEach((badge) => {
        const row = document.createElement('li');
        row.textContent = ['.skill-area-label', '.skill-name', '.skill-years']
          .map((selector) => badge.querySelector(selector)?.textContent?.trim())
          .filter(Boolean).join(' · ');
        list.append(row);
      });
      badges.replaceWith(list);
    });
    await page.addStyleTag({ content: '.print-skill-list { list-style:none; margin:0; padding:0; } .print-skill-list li { display:block; break-inside:avoid; padding:3pt 0; border-top:0.5pt solid #cbc8bf; font:9pt/1.4 Arial,Helvetica,sans-serif; }' });

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
