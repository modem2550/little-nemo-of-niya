#!/usr/bin/env node
/**
 * Image Optimization Script
 * Converts PNGs to WebP and compresses oversized WebP files.
 * Uses `sharp` (already a project dependency).
 *
 * Usage:
 *   node scripts/optimize-images.mjs            # dry-run (report only)
 *   node scripts/optimize-images.mjs --apply     # apply changes
 */

import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const PUBLIC = path.join(ROOT, 'public');

const DRY_RUN = !process.argv.includes('--apply');
const WEBP_QUALITY = 90; // Increased from 80
const MAX_SIZE_KB = 1000; // Flag files larger than 1MB

// ── Helpers ──────────────────────────────────────────────────────────────────

function fmtSize(bytes) {
  if (bytes < 1024) return `${bytes}B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)}KB`;
  return `${(kb / 1024).toFixed(2)}MB`;
}

async function getFiles(dir, exts) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await getFiles(full, exts)));
    } else if (exts.some((e) => entry.name.toLowerCase().endsWith(e))) {
      files.push(full);
    }
  }
  return files;
}

// ── PNG → WebP Conversion ────────────────────────────────────────────────────

async function convertPngsToWebp() {
  const pngs = await getFiles(PUBLIC, ['.png']);

  // Skip favicons / PWA icons (small, must stay PNG)
  const skipPatterns = [
    'android-chrome',
    'apple-touch-icon',
    'favicon',
    'logo 16x16',
    'logo 32x32',
    'icon.png',
  ];

  const candidates = pngs.filter(
    (f) => !skipPatterns.some((p) => path.basename(f).includes(p))
  );

  console.log(`\n🖼️  PNG → WebP Conversion (${candidates.length} candidates)`);
  console.log('─'.repeat(70));

  let totalSaved = 0;

  for (const file of candidates) {
    const stat = await fs.stat(file);
    const origSize = stat.size;
    const webpPath = file.replace(/\.png$/i, '.webp');
    const rel = path.relative(PUBLIC, file);

    try {
      const buffer = await sharp(file).webp({ quality: WEBP_QUALITY }).toBuffer();
      const newSize = buffer.length;
      const saved = origSize - newSize;
      const pct = ((saved / origSize) * 100).toFixed(1);

      console.log(
        `  ${rel.padEnd(40)} ${fmtSize(origSize).padStart(8)} → ${fmtSize(newSize).padStart(8)}  (${pct}% saved)`
      );

      if (!DRY_RUN && saved > 0) {
        await fs.writeFile(webpPath, buffer);
        totalSaved += saved;
      } else {
        totalSaved += saved;
      }
    } catch (err) {
      console.log(`  ⚠️  ${rel} — skipped (${err.message})`);
    }
  }

  console.log(`\n  Total potential savings: ${fmtSize(totalSaved)}`);
  return candidates;
}

// ── Compress Oversized WebPs ─────────────────────────────────────────────────

async function compressOversizedWebps() {
  const webps = await getFiles(PUBLIC, ['.webp']);
  const oversized = [];

  for (const file of webps) {
    const stat = await fs.stat(file);
    if (stat.size > MAX_SIZE_KB * 1024) {
      oversized.push({ file, size: stat.size });
    }
  }

  console.log(`\n📦 Oversized WebP Compression (>${MAX_SIZE_KB}KB — ${oversized.length} files)`);
  console.log('─'.repeat(70));

  let totalSaved = 0;

  for (const { file, size } of oversized) {
    const rel = path.relative(PUBLIC, file);

    try {
      const buffer = await sharp(file).webp({ quality: WEBP_QUALITY }).toBuffer();
      const newSize = buffer.length;
      const saved = size - newSize;
      const pct = ((saved / size) * 100).toFixed(1);

      console.log(
        `  ${rel.padEnd(40)} ${fmtSize(size).padStart(8)} → ${fmtSize(newSize).padStart(8)}  (${pct}% saved)`
      );

      if (!DRY_RUN && saved > 0) {
        await fs.writeFile(file, buffer);
        totalSaved += saved;
      } else {
        totalSaved += Math.max(0, saved);
      }
    } catch (err) {
      console.log(`  ⚠️  ${rel} — skipped (${err.message})`);
    }
  }

  console.log(`\n  Total potential savings: ${fmtSize(totalSaved)}`);
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log(DRY_RUN ? '🔍 DRY RUN — no files will be modified\n' : '🚀 APPLYING changes\n');

  await convertPngsToWebp();
  await compressOversizedWebps();

  if (DRY_RUN) {
    console.log('\n💡 Run with --apply to write changes:');
    console.log('   node scripts/optimize-images.mjs --apply\n');
  } else {
    console.log('\n✅ Optimization complete!\n');
    console.log('⚠️  Remember to:');
    console.log('   1. Update any references from .png to .webp in your code');
    console.log('   2. Keep original PNGs for favicons/PWA icons');
    console.log('   3. Test the site visually\n');
  }
}

main().catch(console.error);
