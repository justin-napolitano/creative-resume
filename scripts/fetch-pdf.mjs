import fs from 'node:fs';
import path from 'node:path';
import https from 'node:https';

const DEFAULT_URL = 'https://raw.githubusercontent.com/justin-napolitano/data-strategist-resume/pit/resume.pdf';
const PDF_URL = process.env.RESUME_PDF_URL ?? DEFAULT_URL;
const DEST_PATH = path.resolve('public', 'resume.pdf');

const download = (url, dest, redirectCount = 0) =>
  new Promise((resolve, reject) => {
    if (redirectCount > 5) {
      reject(new Error('Too many redirects while fetching resume PDF.'));
      return;
    }

    https
      .get(url, (response) => {
        const { statusCode, headers } = response;
        if (statusCode && statusCode >= 300 && statusCode < 400 && headers.location) {
          const redirectUrl = new URL(headers.location, url).toString();
          resolve(download(redirectUrl, dest, redirectCount + 1));
          response.resume();
          return;
        }

        if (statusCode !== 200) {
          reject(new Error(`Failed to download PDF: ${statusCode} ${response.statusMessage}`));
          response.resume();
          return;
        }

        const fileStream = fs.createWriteStream(dest);
        response.pipe(fileStream);
        fileStream.on('finish', () => fileStream.close(resolve));
        fileStream.on('error', reject);
      })
      .on('error', reject);
  });

const run = async () => {
  fs.mkdirSync(path.dirname(DEST_PATH), { recursive: true });
  console.log(`Fetching resume PDF from ${PDF_URL}`);
  await download(PDF_URL, DEST_PATH);
  console.log(`Saved PDF to ${DEST_PATH}`);
};

run().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
