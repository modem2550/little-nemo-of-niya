import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const images = [
  'https://img2.pic.in.th/Gemini_Generated_Image_6nlwnl6nlwnl6nlw.png',
  'https://img2.pic.in.th/Untitled-1656a008758cf5461.png',
  'https://img2.pic.in.th/679067820_1538138747670766_1349428160000992650_n.png'
];

const destDir = path.join(process.cwd(), 'public', 'img');

async function main() {
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  const page = await browser.newPage();
  
  for (const url of images) {
    const filename = path.basename(url);
    const destPath = path.join(destDir, filename);
    console.log(`Navigating to ${url}...`);
    try {
        const response = await page.goto(url, { waitUntil: 'networkidle' });
        const buffer = await response.body();
        fs.writeFileSync(destPath, buffer);
        console.log(`Saved ${filename} to ${destPath}`);
    } catch (e) {
        console.error(`Failed to download ${url}:`, e);
    }
  }
  
  await browser.close();
}

main();
