import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import sharp from 'sharp';

// In-memory cache to store in-flight or completed promises during the build.
// This prevents multiple components from downloading the same image simultaneously.
const inMemoryCache = new Map<string, Promise<string>>();

const MANIFEST_PATH = path.resolve(process.cwd(), '.image-cache.json');
const PUBLIC_DEMMO_DIR = path.resolve(process.cwd(), 'public/demmo');
const PUBLIC_PREFIX = '/demmo';

/**
 * Loads the disk cache manifest.
 */
function loadManifest(): Record<string, string> {
  if (fs.existsSync(MANIFEST_PATH)) {
    try {
      const data = fs.readFileSync(MANIFEST_PATH, 'utf-8');
      return JSON.parse(data);
    } catch (e) {
      console.warn('Failed to parse image cache manifest. Returning empty cache.', e);
      return {};
    }
  }
  return {};
}

/**
 * Saves the disk cache manifest.
 */
function saveManifest(manifest: Record<string, string>) {
  try {
    fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2), 'utf-8');
  } catch (e) {
    console.warn('Failed to write image cache manifest.', e);
  }
}

// Ensure the demmo directory exists
if (!fs.existsSync(PUBLIC_DEMMO_DIR)) {
  fs.mkdirSync(PUBLIC_DEMMO_DIR, { recursive: true });
}

// Load manifest exactly once on module initialization
const diskCache = loadManifest();

/**
 * Processes an external image: downloads, converts to webp, and saves to /public/demmo.
 * 
 * @param url The external image URL
 * @param alt The alt text used to generate the filename
 * @returns The resolved local path (e.g., /demmo/my-cat-a1b2c3.webp)
 */
export async function processImage(url: string, alt: string): Promise<string> {
  // If we already have the URL in disk cache, return the saved path.
  // We should also check if the file actually exists on disk just to be safe.
  if (diskCache[url]) {
    const cachedPath = diskCache[url];
    // cachedPath is like `/demmo/filename.webp`. Let's check local disk:
    const absoluteFilePath = path.join(process.cwd(), 'public', cachedPath);
    if (fs.existsSync(absoluteFilePath)) {
      return cachedPath;
    }
  }

  // If already being processed in-memory, await that promise
  if (inMemoryCache.has(url)) {
    return inMemoryCache.get(url)!;
  }

  // Create a new promise for fetching and processing
  const processPromise = (async () => {
    try {
      // 1. Sanitize filename
      const sanitizedAlt = alt
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-') // replace special chars/spaces with hyphens
        .replace(/(^-|-$)/g, '') || 'image'; // trim leading/trailing hyphens, fallback to 'image'
      
      // 2. Generate short hash from URL to prevent collisions
      const shortHash = crypto.createHash('md5').update(url).digest('hex').substring(0, 6);
      
      const fileName = `${sanitizedAlt}-${shortHash}.webp`;
      const destPath = path.join(PUBLIC_DEMMO_DIR, fileName);
      const publicPath = `${PUBLIC_PREFIX}/${fileName}`;

      // 3. Fetch image
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
      }

      const copyBuffer = Buffer.from(await response.arrayBuffer());

      // 4. Convert and save as WebP
      await sharp(copyBuffer)
        .webp({ quality: 80 }) // You can adjust quality if needed
        .toFile(destPath);

      // 5. Update disk cache and save manifest
      diskCache[url] = publicPath;
      saveManifest(diskCache);

      return publicPath;
    } catch (error) {
      console.error(`[imageFetcher] Error processing image ${url}:`, error);
      // Fallback: Return original URL if anything fails
      return url;
    }
  })();

  // Store in cache
  inMemoryCache.set(url, processPromise);

  return processPromise;
}

/**
 * Normalizes an array of objects by replacing their image URLs with local generated paths.
 * 
 * @param items The array of data objects
 * @param imgKey The property key representing the image URL
 * @param altKey The property key representing the alt text used for the filename
 * @returns A new array with normalized image paths
 */
export async function normalizeImages<T extends Record<string, any>>(
  items: T[], 
  imgKey: keyof T, 
  altKey: keyof T
): Promise<T[]> {
  const normalizedItems = await Promise.all(
    items.map(async (item) => {
      const url = item[imgKey];
      const alt = item[altKey] || 'image';

      if (typeof url === 'string' && (url.startsWith('http://') || url.startsWith('https://'))) {
        const localPath = await processImage(url, alt as string);
        return {
          ...item,
          [imgKey]: localPath
        };
      }
      // If it's already a local path or invalid, return as-is
      return item;
    })
  );

  return normalizedItems;
}
