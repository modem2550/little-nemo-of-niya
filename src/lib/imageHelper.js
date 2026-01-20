/**
 * แปลง image URL/path ให้เป็น path ที่ใช้งานได้
 * Support ทั้งข้อมูลเก่า (full URL) และใหม่ (path only)
 */
export function getImagePath(urlOrPath) {
    if (!urlOrPath) return null;

    // ถ้าเป็น full URL -> แยกเอาแค่ path
    if (urlOrPath.includes('supabase.co')) {
        const match = urlOrPath.match(/event-images\/(.+)$/);
        return match ? match[1] : urlOrPath;
    }

    // ถ้าเป็น path อยู่แล้ว -> ใช้เลย
    return urlOrPath;
}

/**
 * สร้าง URL สำหรับแสดงรูป (ผ่าน proxy API)
 */
export function getImageUrl(urlOrPath) {
    const path = getImagePath(urlOrPath);
    return path ? `/api/image/${path}` : null;
}

/**
 * แปลง image_urls object ทั้งหมด
 */
export function normalizeImageUrls(imageUrls) {
    if (!imageUrls) return null;

    return {
        thumbnail: getImageUrl(imageUrls.thumbnail),
        small: getImageUrl(imageUrls.small),
        medium: getImageUrl(imageUrls.medium),
        large: getImageUrl(imageUrls.large),
    };
}