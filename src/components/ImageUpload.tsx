import React, { useRef, useState, useEffect } from 'react';
import { compressImage } from '../utils/imageCompression';
import { optimizeImage, supportsWebP, createProgressiveImage } from '../utils/imageOptimization';
import { uploadImage } from '../cloudinary';

// Format file size helper
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

interface ImageUploadProps {
  onImageUpload: (imageUrl: string) => void;
  isDarkMode: boolean;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onImageUpload, isDarkMode }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [compressedSize, setCompressedSize] = useState<number>(0);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('Please select a valid image file (JPG, JPEG, PNG, GIF, or WebP)');
      return;
    }

    // Store original size
    setOriginalSize(file.size);

    setIsCompressing(true);

    try {
      // Check WebP support and optimize accordingly
      const webPSupported = await supportsWebP();
      const optimizedImage = await optimizeImage(file, {
        maxWidth: 800,
        maxHeight: 600,
        quality: 0.7,
        format: webPSupported ? 'webp' : 'jpeg'
      });
      
      setCompressedSize(optimizedImage.size);
      
      // Show compression info
      const compressionRatio = ((file.size - optimizedImage.size) / file.size * 100).toFixed(1);
      console.log(`Image optimized: ${formatFileSize(file.size)} → ${formatFileSize(optimizedImage.size)} (${compressionRatio}% reduction, ${webPSupported ? 'WebP' : 'JPEG'} format)`);
      
      setIsCompressing(false);
      setIsUploading(true);

      // Convert optimized blob to File for upload
      const optimizedFile = new File([optimizedImage.blob], file.name, {
        type: `image/${webPSupported ? 'webp' : 'jpeg'}`
      });

      // Upload optimized image
      const imageUrl = await uploadImage(optimizedFile);
      onImageUpload(imageUrl);
    } catch (error) {
      console.error('Error processing image:', error);
      alert('Failed to process image. Please try again.');
    } finally {
      setIsCompressing(false);
      setIsUploading(false);
      // Clear the input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      // Reset size states after a delay
      setTimeout(() => {
        setOriginalSize(0);
        setCompressedSize(0);
      }, 3000);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="relative">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png"
        onChange={handleFileSelect}
        className="hidden"
        disabled={isUploading || isCompressing}
      />
      
      <button
        type="button"
        onClick={handleButtonClick}
        disabled={isUploading || isCompressing}
        className={`p-2 rounded-full transition-colors ${
          isUploading || isCompressing
            ? 'opacity-50 cursor-not-allowed'
            : isDarkMode
            ? 'hover:bg-whatsapp-dark-hover text-gray-300'
            : 'hover:bg-gray-100 text-gray-600'
        }`}
        aria-label="Attach image"
        title={
          isCompressing 
            ? 'Compressing...' 
            : isUploading 
              ? 'Uploading...' 
              : 'Attach image'
        }
      >
        {isCompressing ? (
          <div className="flex items-center space-x-1">
            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span className="text-xs">🗜️</span>
          </div>
        ) : isUploading ? (
          <svg className="animate-spin h-6 w-6" fill="none" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        )}
      </button>
      
      {/* Compression info */}
      {(originalSize > 0 && compressedSize > 0) && (
        <div className={`absolute -top-16 left-0 p-2 rounded-lg text-xs whitespace-nowrap ${
          isDarkMode ? 'bg-gray-800 text-white' : 'bg-gray-800 text-white'
        }`}>
          <div>Original: {formatFileSize(originalSize)}</div>
          <div>Compressed: {formatFileSize(compressedSize)}</div>
          <div>Reduced: {((originalSize - compressedSize) / originalSize * 100).toFixed(1)}%</div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
