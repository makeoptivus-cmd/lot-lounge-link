/**
 * Media compression utilities to reduce file sizes for browser storage
 * Compresses images and videos to fit within localStorage limits
 */

/**
 * Compress image by reducing quality and dimensions
 * Can reduce size by 60-80%
 */
export async function compressImage(
  file: File,
  maxWidth: number = 1200,
  maxHeight: number = 1200,
  quality: number = 0.75
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions maintaining aspect ratio
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to compress image'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to compressed data URL
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Compress video by extracting first frame as thumbnail
 * Or store video with quality reduced (simplified version)
 * For heavy compression, consider storing video reference instead
 */
export async function compressVideo(file: File): Promise<string> {
  // For now, just return DataURL but set a size warning
  // Real video compression would require FFmpeg or similar
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const videoDataUrl = e.target?.result as string;
      // Return as-is; user should pre-compress videos
      resolve(videoDataUrl);
    };
    
    reader.onerror = () => reject(new Error('Failed to read video'));
    reader.readAsDataURL(file);
  });
}

/**
 * Extract first frame of video as thumbnail (for preview)
 * Much smaller than storing full video
 */
export async function extractVideoThumbnail(videoFile: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const video = document.createElement('video');
      video.onloadedmetadata = () => {
        video.currentTime = 0;
      };
      
      video.onseeked = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 320;
        canvas.height = 180;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to create thumbnail'));
          return;
        }
        
        ctx.drawImage(video, 0, 0, 320, 180);
        const thumbnail = canvas.toDataURL('image/jpeg', 0.7);
        resolve(thumbnail);
      };
      
      video.onerror = () => reject(new Error('Failed to process video'));
      video.src = e.target?.result as string;
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(videoFile);
  });
}

/**
 * Calculate estimated storage size
 * Files are stored as base64 which increases size by ~33%
 */
export function estimateStorageSize(fileSizeInBytes: number): number {
  // Base64 encoding increases size by ~33%
  return Math.ceil(fileSizeInBytes * 1.33);
}

/**
 * Format bytes to human readable size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Get browser storage available
 * Note: This is an estimate and varies by browser
 */
export async function getStorageEstimate(): Promise<{ usage: number; quota: number }> {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    const estimate = await navigator.storage.estimate();
    return {
      usage: estimate.usage || 0,
      quota: estimate.quota || 0,
    };
  }
  
  // Fallback: localStorage limit is usually 5-10MB
  return {
    usage: 0,
    quota: 5 * 1024 * 1024, // 5MB estimate
  };
}
