import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const CDN_DOMAIN = ''; // Empty string for local serving
const ASSET_OUT_DIR = 'transformed-assets';
const CACHE_DIR = '.cache/cdn-assets';

const WHITELIST_FILENAMES = [
  'BG-img.webp',
  'bg-ranking-member.png',
  'h-body.webp',
  'lit-img.webp',
  'profile.webp'
];

const EXT = {
  images: ['png', 'webp', 'jpg', 'jpeg', 'gif'],
  videos: ['mp4', 'webm', 'ogv', 'mov'],
  docs: ['pdf', 'zip', 'rar', '7z', 'doc', 'docx', 'xls', 'xlsx']
};

const ALL_EXT = [...EXT.images, ...EXT.videos, ...EXT.docs];

// ---------------- UTILS ----------------

const hash = (str) =>
  crypto.createHash('sha1').update(str).digest('hex').slice(0, 8);

const safeName = (url) => {
  try {
    let name = url.split('/').pop().split('?')[0].split('#')[0];
    name = name.replace(/\.[^/.]+$/, '');
    if (!name || name.length < 2) name = 'asset-' + hash(url).slice(0, 4);
    return name.replace(/[^a-z0-9_-]/gi, '_');
  } catch {
    return 'asset';
  }
};

// concurrency limiter
class Semaphore {
  constructor(max) {
    this.max = max;
    this.running = 0;
    this.queue = [];
  }
  async acquire() {
    if (this.running >= this.max) {
      await new Promise((r) => this.queue.push(r));
    }
    this.running++;
  }
  release() {
    this.running--;
    if (this.queue.length) this.queue.shift()();
  }
}

// cache
const Cache = {
  init(base) {
    const p = path.join(base, CACHE_DIR);
    if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
    return p;
  },
  get(p, key) {
    const f = path.join(p, hash(key) + '.json');
    return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : null;
  },
  set(p, key, val) {
    fs.writeFileSync(path.join(p, hash(key) + '.json'), JSON.stringify(val));
  }
};

// retry fetch
const fetchRetry = async (url, retries = 2) => {
  for (let i = 0; i <= retries; i++) {
    try {
      return await fetch(url, { signal: AbortSignal.timeout(5000) });
    } catch (e) {
      if (i === retries) throw e;
    }
  }
};

// ---------------- MAIN ----------------

export default function cdnTransformer() {
  return {
    name: 'cdn-transformer-final',
    hooks: {
      'astro:build:done': async ({ dir }) => {
        const outDir = fileURLToPath(dir);
        const cacheDir = Cache.init(process.cwd());
        const limit = new Semaphore(5);

        const stats = {
          images: 0,
          videos: 0,
          docs: 0,
          skipped: 0,
          failed: 0,
          cacheHits: 0
        };

        const assets = new Map();

        // 🔥 build file index (FAST)
        const fileIndex = new Map();
        const buildIndex = (dir) => {
          for (const item of fs.readdirSync(dir)) {
            const full = path.join(dir, item);
            if (fs.statSync(full).isDirectory()) buildIndex(full);
            else fileIndex.set(item, full);
          }
        };
        buildIndex(outDir);

        // ---------- transform URL ----------
        const transformUrl = (url) => {
          if (!url || url.startsWith('data:') || url.startsWith('blob:') || (CDN_DOMAIN && url.startsWith(CDN_DOMAIN))) return url;

          if (url.includes('/logo/') || url.includes('/public/logo/')) {
            stats.skipped++;
            return url;
          }

          const filename = url.split('/').pop().split('?')[0];
          if (WHITELIST_FILENAMES.some(f => filename.includes(f))) {
            stats.skipped++;
            return url;
          }

          const extMatch = url.match(new RegExp(`\\.(${ALL_EXT.join('|')})(\\?|#|$)`, 'i'));
          if (!extMatch && !url.includes('gstatic.com')) return url;

          const originalExt = extMatch ? extMatch[1].toLowerCase() : 'jpg';
          const isSvg = originalExt === 'svg';

          const isImg = EXT.images.includes(originalExt) && !isSvg;
          const isVid = EXT.videos.includes(originalExt);
          const isDoc = EXT.docs.includes(originalExt);

          const finalExt = isImg ? '.jpg' : `.${originalExt}`;
          const h = hash(url);
          const name = safeName(url);
          const newFile = `${name}-${h}${finalExt}`;

          const cdnUrl = `/${ASSET_OUT_DIR}/${newFile}`;

          if (!assets.has(url)) {
            assets.set(url, { url, newFile, isImg, isVid, isDoc });
          }

          return cdnUrl;
        };

        // ---------- scan content ----------
        const processFile = (file) => {
          let content = fs.readFileSync(file, 'utf8');
          let changed = false;

          // src / href / poster
          content = content.replace(/\b(src|href|poster)=["']([^"']+)["']/gi, (m, attr, val) => {
            const t = transformUrl(val);
            if (t !== val) { changed = true; return `${attr}="${t}"`; }
            return m;
          });

          // srcset
          content = content.replace(/\bsrcset=["']([^"']+)["']/gi, (m, val) => {
            const out = val.split(',').map(v => {
              const parts = v.trim().split(/\s+/);
              const u = parts[0];
              const rest = parts.slice(1).join(' ');
              const t = transformUrl(u);
              if (t !== u) changed = true;
              return rest ? `${t} ${rest}` : t;
            }).join(', ');
            return `srcset="${out}"`;
          });

          // CSS url()
          content = content.replace(/url\(["']?([^"'\)]+)["']?\)/gi, (m, val) => {
            const t = transformUrl(val);
            if (t !== val) { changed = true; return `url('${t}')`; }
            return m;
          });

          // raw urls
          content = content.replace(/https?:\/\/[^\s"'()]+/gi, (url) => {
            const t = transformUrl(url);
            if (t !== url) { changed = true; return t; }
            return url;
          });

          if (changed) fs.writeFileSync(file, content);
        };

        const walk = (dir) => {
          for (const item of fs.readdirSync(dir)) {
            const full = path.join(dir, item);
            if (fs.statSync(full).isDirectory()) walk(full);
            else if (/\.(html|css|js|mjs)$/.test(item)) processFile(full);
          }
        };

        walk(outDir);

        // ---------- create assets ----------
        const outAssets = path.join(outDir, ASSET_OUT_DIR);
        if (!fs.existsSync(outAssets)) fs.mkdirSync(outAssets, { recursive: true });

        const tasks = [...assets.values()].map(async (a) => {
          const outPath = path.join(outAssets, a.newFile);

          const cached = Cache.get(cacheDir, a.url);
          if (cached && fs.existsSync(outPath)) {
            stats.cacheHits++;
            return;
          }

          await limit.acquire();
          try {
            let buffer;

            if (a.url.startsWith('http')) {
              const res = await fetchRetry(a.url);
              if (!res.ok) throw new Error(res.status);
              buffer = Buffer.from(await res.arrayBuffer());
            } else {
              const file = fileIndex.get(a.url.split('/').pop().split('?')[0]);
              if (!file) return;
              buffer = fs.readFileSync(file);
            }

            // small file skip optimize
            if (buffer.length < 5 * 1024) {
              fs.writeFileSync(outPath, buffer);
            } else if (a.isImg) {
              await sharp(buffer)
                .flatten({ background: '#fff' })
                .jpeg({ quality: 80, mozjpeg: true })
                .toFile(outPath);
              stats.images++;
            } else {
              fs.writeFileSync(outPath, buffer);
              if (a.isVid) stats.videos++; else stats.docs++;
            }

            Cache.set(cacheDir, a.url, { file: a.newFile });
          } catch (e) {
            stats.failed++;
          } finally {
            limit.release();
          }
        });

        await Promise.all(tasks);

        /*
          [cdn-transformer FINAL SUMMARY]
          Images: ${stats.images}
          Videos: ${stats.videos}
          Docs:   ${stats.docs}
          Cache:  ${stats.cacheHits}
          Skip:   ${stats.skipped}
          Fail:   ${stats.failed}
        */
      }
    }
  };
}