import 'server-only';

import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';
import type { IInspection } from '@/types/db';
import { buildInspectionReportHtml } from './build-html';

export type GenerateReportPdfOptions = {
  origin: string;
  forEmail?: boolean;
  maxPhotos?: number;
};

async function launchBrowser() {
  const isServerless = process.env.VERCEL === '1' || process.env.AWS_LAMBDA_FUNCTION_NAME;

  if (isServerless) {
    return puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: true,
    });
  }

  const localChrome =
    process.env.PUPPETEER_EXECUTABLE_PATH ||
    process.env.CHROME_PATH ||
    (process.platform === 'win32'
      ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
      : process.platform === 'darwin'
        ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
        : '/usr/bin/google-chrome');

  return puppeteer.launch({
    executablePath: localChrome,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });
}

async function htmlToPdfBuffer(html: string): Promise<Buffer> {
  const browser = await launchBrowser();
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'load', timeout: 55_000 });
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '6mm', right: '6mm', bottom: '6mm', left: '6mm' },
    });
    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}

/** PDF matching Print Report / InspectionReportView layout. */
export async function generateReportPdf(
  inspection: IInspection,
  options: GenerateReportPdfOptions
): Promise<Buffer> {
  const maxPhotos = options.maxPhotos ?? (options.forEmail ? 24 : undefined);
  const html = await buildInspectionReportHtml(inspection, {
    origin: options.origin,
    maxPhotos,
  });
  return htmlToPdfBuffer(html);
}
