/**
 * Converts a URL to a Base64 string using fetch and FileReader.
 * This helps bypass CORS issues when capturing the DOM with dom-to-image.
 */
export async function urlToBase64(url: string): Promise<string> {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`);
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    } catch (error) {
        console.error('[urlToBase64] Error:', error);
        throw error;
    }
}

/**
 * Ensures that the dom-to-image-more library is loaded.
 */
export async function ensureDomToImage(): Promise<void> {
    if ((window as any).domtoimage) return;
    
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/dom-to-image-more/3.4.0/dom-to-image-more.min.js';
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load dom-to-image-more'));
        document.head.appendChild(script);
    });
}

/**
 * Waits for all fonts in the document to be loaded.
 */
export async function waitForFonts(): Promise<void> {
    if ('fonts' in document) {
        await document.fonts.ready;
    }
}
/**
 * Robustly wait for an <img> element to load.
 * Checks naturalWidth > 0 (actual image data loaded), listens to 'load' event,
 * and falls back to continuous polling.
 */
export function waitForImageElement(img: HTMLImageElement | null, timeout = 10000): Promise<void> {
    if (!img) return Promise.resolve();
    
    return new Promise((resolve, reject) => {
        const start = Date.now();
        
        // Check if already loaded
        if (img.complete && img.naturalWidth > 0) {
            resolve();
            return;
        }

        // Listen for load event
        const onLoad = () => {
            img.removeEventListener('load', onLoad);
            img.removeEventListener('error', onError);
            resolve();
        };
        
        const onError = () => {
            img.removeEventListener('load', onLoad);
            img.removeEventListener('error', onError);
            // We still resolve instead of reject to allow capture to proceed 
            // even if one image fails, though the user might see a blank spot.
            // Or we could reject to show error. The user's prompt suggests waiting.
            resolve(); 
        };
        
        img.addEventListener('load', onLoad, { once: true });
        img.addEventListener('error', onError, { once: true });

        // Fallback: check continuously for naturalWidth
        const check = setInterval(() => {
            if (img.naturalWidth > 0) {
                clearInterval(check);
                onLoad();
            } else if (Date.now() - start > timeout) {
                clearInterval(check);
                resolve(); // Timeout fallback
            }
        }, 50);
    });
}

/**
 * Wait for all background images within a container to load.
 * Backup mechanism for legacy code using backgroundImage.
 */
export async function waitForBackgroundImages(container: HTMLElement, timeout = 10000): Promise<void> {
    const elements = container.querySelectorAll('*');
    const promises: Promise<void>[] = [];
    
    elements.forEach((el) => {
        const style = window.getComputedStyle(el);
        const bg = style.backgroundImage;
        if (bg && bg !== 'none' && bg.startsWith('url(')) {
            const url = bg.slice(4, -1).replace(/['"]/g, "");
            const img = new Image();
            img.src = url;
            promises.push(waitForImageElement(img, timeout));
        }
    });
    
    await Promise.all(promises);
}
