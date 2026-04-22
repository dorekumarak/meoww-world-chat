// Image compression utility to reduce file size to less than 400KB

export const compressImage = async (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        // Initial dimensions
        let { width, height } = img;
        
        // Calculate compression ratio based on initial file size
        const initialSize = file.size;
        const targetSize = 400 * 1024; // 400KB
        const compressionRatio = Math.sqrt(targetSize / initialSize);
        
        // Apply compression to dimensions
        if (initialSize > targetSize) {
          width = Math.floor(width * compressionRatio);
          height = Math.floor(height * compressionRatio);
        }
        
        // Set canvas dimensions
        canvas.width = width;
        canvas.height = height;
        
        // Draw image on canvas
        ctx.drawImage(img, 0, 0, width, height);
        
        // Try different quality levels to get under 400KB
        let quality = 0.8;
        let compressedDataUrl = '';
        
        const tryCompress = (qualityLevel: number): Promise<string> => {
          return new Promise((resolve) => {
            canvas.toBlob(
              (blob) => {
                if (blob) {
                  const dataUrl = URL.createObjectURL(blob);
                  resolve(dataUrl);
                } else {
                  resolve('');
                }
              },
              'image/jpeg',
              qualityLevel
            );
          });
        };
        
        const findOptimalQuality = async () => {
          // Start with high quality and reduce if needed
          for (let q = 0.9; q >= 0.1; q -= 0.1) {
            const dataUrl = await tryCompress(q);
            
            // Convert dataUrl back to blob to check size
            return fetch(dataUrl)
              .then(res => res.blob())
              .then(blob => {
                if (blob.size <= targetSize) {
                  // Create new File from blob
                  const compressedFile = new File([blob], file.name, {
                    type: 'image/jpeg',
                    lastModified: Date.now()
                  });
                  return compressedFile;
                }
                return null;
              });
          }
          
          // If still too large, use very low quality
          return tryCompress(0.1).then(dataUrl => {
            return fetch(dataUrl)
              .then(res => res.blob())
              .then(blob => {
                return new File([blob], file.name, {
                  type: 'image/jpeg',
                  lastModified: Date.now()
                });
              });
          });
        };
        
        findOptimalQuality().then(compressedFile => {
          resolve(compressedFile!);
        }).catch(error => {
          reject(error);
        });
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
  });
};

// Alternative simpler compression using canvas with fixed quality
export const compressImageSimple = async (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        // Calculate new dimensions to reduce size
        const maxDimension = 1200; // Max width/height
        let { width, height } = img;
        
        if (width > maxDimension || height > maxDimension) {
          const ratio = Math.min(maxDimension / width, maxDimension / height);
          width = Math.floor(width * ratio);
          height = Math.floor(height * ratio);
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now()
              });
              resolve(compressedFile);
            } else {
              reject(new Error('Compression failed'));
            }
          },
          'image/jpeg',
          0.7 // Start with 70% quality
        );
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
  });
};

// Get file size in human readable format
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
