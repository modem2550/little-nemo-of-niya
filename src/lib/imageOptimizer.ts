import imageCompression from 'browser-image-compression';

export interface ImageSizes {
  thumbnail: File;
  small: File;
  medium: File;
  large: File;
}

export interface OptimizationProgress {
  size: string;
  progress: number;
  status: 'pending' | 'processing' | 'complete';
}

/**
 * สร้างรูปภาพหลายขนาดสำหรับ responsive images
 */
export async function generateResponsiveImages(
  file: File,
  onProgress?: (progress: OptimizationProgress) => void
): Promise<ImageSizes> {
  
  const sizes = {
    thumbnail: { 
      maxWidthOrHeight: 150, 
      initialQuality: 0.7,
      description: 'Thumbnail (150px)'
    },
    small: { 
      maxWidthOrHeight: 640, 
      initialQuality: 0.8,
      description: 'Small - Mobile (640px)'
    },
    medium: { 
      maxWidthOrHeight: 1024, 
      initialQuality: 0.85,
      description: 'Medium - Tablet (1024px)'
    },
    large: { 
      maxWidthOrHeight: 1920, 
      initialQuality: 0.9,
      description: 'Large - Desktop (1920px)'
    },
  };

  const results: any = {};

  for (const [size, options] of Object.entries(sizes)) {
    // Notify start
    if (onProgress) {
      onProgress({
        size: options.description,
        progress: 0,
        status: 'processing'
      });
    }

    // Compress image
    const compressedFile = await imageCompression(file, {
      maxWidthOrHeight: options.maxWidthOrHeight,
      maxSizeMB: 1, // Max 1MB per file
      initialQuality: options.initialQuality,
      useWebWorker: true,
      fileType: 'image/webp', // Convert to WebP
      onProgress: (percent) => {
        if (onProgress) {
          onProgress({
            size: options.description,
            progress: percent,
            status: 'processing'
          });
        }
      }
    });

    // Create new file with proper naming
    const originalName = file.name.split('.')[0];
    const newFile = new File(
      [compressedFile],
      `${size}-${originalName}.webp`,
      { type: 'image/webp' }
    );

    results[size] = newFile;

    // Notify complete
    if (onProgress) {
      onProgress({
        size: options.description,
        progress: 100,
        status: 'complete'
      });
    }
  }

  return results as ImageSizes;
}

/**
 * ตรวจสอบความถูกต้องของไฟล์
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  // Check if it's an image
  if (!file.type.startsWith('image/')) {
    return { valid: false, error: 'กรุณาเลือกไฟล์รูปภาพเท่านั้น' };
  }

  // Check file size (max 10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return { valid: false, error: 'ไฟล์ใหญ่เกิน 10MB' };
  }

  return { valid: true };
}

/**
 * แปลง bytes เป็น KB/MB
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return bytes + ' B';
  } else if (bytes < 1024 * 1024) {
    return (bytes / 1024).toFixed(1) + ' KB';
  } else {
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }
}