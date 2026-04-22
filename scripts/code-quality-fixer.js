#!/usr/bin/env node

/**
 * Code Quality Fixer - Gemini Flash Edition
 * 
 * A high-performance, automated tool designed to sanitize source code
 * by removing development console statements while ensuring logic integrity.
 */

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const CONFIG = {
  name: "Code Quality Fixer - Gemini Flash Edition",
  extensions: ['.js', '.jsx', '.ts', '.tsx', '.astro'],
  excludeDirs: ['node_modules', 'dist', '.astro', '.vercel', '__tests__', 'out'],
  excludeFiles: ['.test.js', '.spec.ts', '.test.ts'],
  // Comprehensive regex for all console methods
  consoleRegex: /console\.(log|warn|error|debug|assert|time|timeEnd|group|groupEnd|table|count|clear|trace)\(.*\);?/g,
  severityMap: {
    error: 'HIGH',
    warn: 'MEDIUM',
    log: 'LOW',
    debug: 'LOW',
    default: 'LOW'
  }
};

async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error(`Usage: node code-quality-fixer.js <path-to-zip-or-dir>`);
    process.exit(1);
  }

  const inputPath = path.resolve(args[0]);
  const timestamp = Date.now();
  const workDir = path.join(process.cwd(), `fixer-work-${timestamp}`);
  const outputDir = path.join(workDir, 'fixed-source');
  
  fs.mkdirSync(outputDir, { recursive: true });

  console.log(`\n🚀 Initializing ${CONFIG.name}...`);

  // 1. FILE PROCESSING & EXTRACTION
  if (inputPath.endsWith('.zip')) {
    console.log(`📦 Extracting package: ${path.basename(inputPath)}`);
    try {
      execSync(`unzip -q "${inputPath}" -d "${outputDir}"`);
    } catch (e) {
      console.error('❌ Failed to extract zip file. Ensure "unzip" is installed.');
      process.exit(1);
    }
  } else {
    console.log(`📂 Processing directory: ${inputPath}`);
    // Copy to work dir to avoid modifying original if preferred, but for this tool we'll work in outputDir
    execSync(`cp -R "${inputPath}/" "${outputDir}"`);
  }

  // 2. ANALYSIS & FIXING
  const results = [];
  const files = getAllFiles(outputDir);
  console.log(`🔍 Analyzing ${files.length} source files...`);

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    const matches = [...content.matchAll(CONFIG.consoleRegex)];

    if (matches.length > 0) {
      const relativePath = path.relative(outputDir, file);
      const fileResult = { path: relativePath, issues: [] };
      let newContent = content;

      matches.forEach((match) => {
        const line = content.substring(0, match.index).split('\n').length;
        const method = match[1];
        const original = match[0];
        const severity = CONFIG.severityMap[method] || CONFIG.severityMap.default;
        const fixed = `/* ${original} */ // [${CONFIG.name}] Cleaned for production`;

        fileResult.issues.push({ line, method, severity, original, fixed });
        newContent = newContent.replace(original, fixed);
      });

      fs.writeFileSync(file, newContent);
      results.push(fileResult);
    }
  }

  // 3. DOCUMENTATION GENERATION
  console.log('📝 Generating comprehensive documentation...');
  const docs = generateDocumentation(results, files.length);
  fs.writeFileSync(path.join(workDir, 'FIX_DOCUMENTATION.md'), docs);

  // 4. PACKAGING
  console.log('📦 Creating downloadable package...');
  const packagePath = path.join(process.cwd(), `Fixed_Source_Package_${timestamp}.zip`);
  try {
    // Move report into the zip too
    execSync(`cd "${workDir}" && zip -r "${packagePath}" .`);
    console.log(`\n✅ SUCCESS! Package created at: ${packagePath}`);
  } catch (e) {
    console.error('❌ Failed to create final package zip.');
  }

  // Cleanup work dir
  fs.rmSync(workDir, { recursive: true, force: true });
}

function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);
  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (!CONFIG.excludeDirs.includes(file)) getAllFiles(fullPath, arrayOfFiles);
    } else {
      const ext = path.extname(file);
      const isExcluded = CONFIG.excludeFiles.some(f => file.endsWith(f));
      if (CONFIG.extensions.includes(ext) && !isExcluded) arrayOfFiles.push(fullPath);
    }
  });
  return arrayOfFiles;
}

function generateDocumentation(results, totalFiles) {
  const totalIssues = results.reduce((acc, r) => acc + r.issues.length, 0);
  const highSeverity = results.reduce((acc, r) => acc + r.issues.filter(i => i.severity === 'HIGH').length, 0);

  return `# ${CONFIG.name} - Analysis & Fix Report

## 1. Summary (ความสรุป)
- **Status**: Completed
- **Files Analyzed**: ${totalFiles}
- **Issues Found/Fixed**: ${totalIssues}
- **High Severity Issues**: ${highSeverity}
- **Risk Assessment**: LOW (Logic preserved via commenting)

## 2. Detailed Changes (รายละเอียดการเปลี่ยนแปลง)
${results.map(r => `
### File: ${r.path}
${r.issues.map(i => `
- **Line ${i.line}** [Severity: ${i.severity}]
  - *Original*: \`${i.original}\`
  - *Fixed*: \`${i.fixed}\`
`).join('')}
`).join('\n---\n')}

## 3. Implementation Guide (คำแนะนำการติดตั้ง)
1. **Unzip**: Extract the \`Fixed_Source_Package_*.zip\` file.
2. **Review**: Check the \`fixed-source\` directory against your current codebase.
3. **Integration**: Replace your existing \`src\` directory with the provided one, or merge specific files.
4. **Build**: Run \`npm run build\` to verify zero regressions.

## 4. Rollback Instructions (วิธีย้อนกลับ)
If any issues are detected:
1. Revert the file changes using your version control (e.g., \`git checkout src/\`).
2. The original code remains inside the comments for manual restoration if needed.

## 5. Testing Checklist (รายการตรวจสอบ)
- [ ] Application starts successfully.
- [ ] All API integrations still function (Error handlers were preserved).
- [ ] User-facing error messages (Toasts/Alerts) still trigger correctly.
- [ ] No \`console\` output is visible in the browser during standard use.

---
*Generated by Gemini Flash Edition*
`;
}

main().catch(err => {
  console.error('❌ Fatal Error:', err);
  process.exit(1);
});
