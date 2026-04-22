// Advanced image optimization for ultra-fast loading
export interface OptimizedImageOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png';
}

// Compress and optimize images
export const optimizeImage = (
  file: File,
  options: OptimizedImageOptions = {}
): Promise<{ blob: Blob; url: string; size: number }> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const img = new Image();

    img.onload = () => {
      const { maxWidth = 800, maxHeight = 600, quality = 0.8, format = 'webp' } = options;
      
      // Calculate new dimensions
      let { width, height } = img;
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }

      // Resize and compress
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);

      // Convert to optimal format
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            resolve({ blob, url, size: blob.size });
          }
        },
        `image/${format}`,
        quality
      );
    };

    img.src = URL.createObjectURL(file);
  });
};

// Progressive image loading with blur effect
export const createProgressiveImage = (src: string, placeholder?: string) => {
  const img = new Image();
  img.loading = 'lazy';
  
  // Add blur placeholder
  if (placeholder) {
    img.style.filter = 'blur(5px)';
    img.style.transition = 'filter 0.3s ease-out';
  }

  img.onload = () => {
    if (placeholder) {
      img.style.filter = 'none';
    }
  };

  img.src = src;
  return img;
};

// Preload critical images
export const preloadCriticalImages = (imageUrls: string[]) => {
  imageUrls.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = url;
    document.head.appendChild(link);
  });
};

// Check WebP support
export const supportsWebP = async (): Promise<boolean> => {
  return new Promise(resolve => {
    const webP = new Image();
    webP.onload = webP.onerror = () => {
      resolve(webP.height === 2);
    };
    webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgJSygJOQeKjI=';
  });
};
