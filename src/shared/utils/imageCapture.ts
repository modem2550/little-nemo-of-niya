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
