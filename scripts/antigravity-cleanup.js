#!/usr/bin/env node

/**
 * Antigravity Console Cleanup Script
 * Automated tool to scan, fix, and report console statements in JS/TS projects.
 */

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configuration
const CONFIG = {
  extensions: ['.js', '.jsx', '.ts', '.tsx', '.astro'],
  excludeDirs: ['node_modules', 'dist', '.astro', '.vercel', '__tests__'],
  excludeFiles: ['.test.js', '.spec.ts', '.test.ts'],
  consoleRegex: /console\.(log|warn|error|debug|assert|time|timeEnd|group|groupEnd|table|count|clear)\(.*\);?/g
};

async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error('Usage: node antigravity-cleanup.js <path-to-zip-or-dir>');
    process.exit(1);
  }

  let targetPath = path.resolve(args[0]);
  let isTemp = false;

  // Handle Zip File
  if (targetPath.endsWith('.zip')) {
    const tempDir = path.join(process.cwd(), '.antigravity-temp-' + Date.now());
    fs.mkdirSync(tempDir, { recursive: true });
    console.log(`Extracting ${targetPath} to ${tempDir}...`);
    try {
      execSync(`unzip -q "${targetPath}" -d "${tempDir}"`);
      targetPath = tempDir;
      isTemp = true;
    } catch (e) {
      console.error('Failed to extract zip file. Ensure "unzip" is installed.');
      process.exit(1);
    }
  }

  const results = [];
  const files = getAllFiles(targetPath);

  console.log(`Scanning ${files.length} files...`);

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    const matches = [...content.matchAll(CONFIG.consoleRegex)];

    if (matches.length > 0) {
      const relativePath = path.relative(targetPath, file);
      const fileResult = {
        path: relativePath,
        fullPath: file,
        issues: []
      };

      let newContent = content;
      matches.forEach((match) => {
        const line = content.substring(0, match.index).split('\n').length;
        const original = match[0];
        const fixed = `/* ${original} */ // Removed for production`;
        
        fileResult.issues.push({
          line,
          type: match[1],
          original,
          fixed
        });

        // Simple replacement (safe for basic console calls)
        newContent = newContent.replace(original, fixed);
      });

      fs.writeFileSync(file, newContent);
      results.push(fileResult);
    }
  }

  // Generate Report
  const report = generateReport(results);
  const reportPath = path.join(process.cwd(), 'cleanup-report.md');
  fs.writeFileSync(reportPath, report);

  console.log('\nCleanup Complete!');
  console.log(`- Files Analyzed: ${files.length}`);
  console.log(`- Files Fixed: ${results.length}`);
  console.log(`- Total Issues: ${results.reduce((acc, r) => acc + r.issues.length, 0)}`);
  console.log(`- Report Generated: ${reportPath}`);

  if (isTemp) {
    console.log(`\nNote: Fixed files are located in ${targetPath}`);
    console.log('Please verify the changes before manual integration.');
  }
}

function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (!CONFIG.excludeDirs.includes(file)) {
        getAllFiles(fullPath, arrayOfFiles);
      }
    } else {
      const ext = path.extname(file);
      const isExcluded = CONFIG.excludeFiles.some(f => file.endsWith(f));
      if (CONFIG.extensions.includes(ext) && !isExcluded) {
        arrayOfFiles.push(fullPath);
      }
    }
  });

  return arrayOfFiles;
}

function generateReport(results) {
  const totalIssues = results.reduce((acc, r) => acc + r.issues.length, 0);
  
  let md = `# Antigravity Cleanup Report\n\n`;
  md += `**Total Issues Found:** ${totalIssues}\n`;
  md += `**Files Affected:** ${results.length}\n`;
  md += `**Risk Level:** LOW\n\n`;

  md += `## Summary\n\n`;
  md += `| File | Issues | Status |\n`;
  md += `| :--- | :---: | :--- |\n`;
  results.forEach(r => {
    md += `| ${r.path} | ${r.issues.length} | FIXED |\n`;
  });

  md += `\n## Detailed Changes\n\n`;
  results.forEach(r => {
    md += `### ${r.path}\n`;
    r.issues.forEach(issue => {
      md += `**Line ${issue.line} (${issue.type})**\n`;
      md += `\`\`\`diff\n- ${issue.original}\n+ ${issue.fixed}\n\`\`\`\n\n`;
    });
    md += `---\n\n`;
  });

  md += `## Integration Guide\n\n`;
  md += `1. Review the changes in the fixed files.\n`;
  md += `2. Run your test suite to ensure no logic was accidentally altered.\n`;
  md += `3. Merge the changes into your production branch.\n\n`;

  md += `## Testing Checklist\n\n`;
  md += `- [ ] Application builds without errors.\n`;
  md += `- [ ] User-facing error messages still appear.\n`;
  md += `- [ ] Fallback logic (try/catch) still functions.\n`;

  return md;
}

main().catch(err => {
  console.error('Fatal Error:', err);
  process.exit(1);
});
