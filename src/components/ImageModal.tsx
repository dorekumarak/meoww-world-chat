import React from 'react';

interface ImageModalProps {
  imageUrl: string;
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  senderName?: string;
  timestamp?: any;
}

const ImageModal: React.FC<ImageModalProps> = ({ 
  imageUrl, 
  isOpen, 
  onClose, 
  isDarkMode, 
  senderName, 
  timestamp 
}) => {
  if (!isOpen) return null;

  const handleDownload = () => {
    try {
      // Create a temporary link element for download
      const link = document.createElement('a');
      link.href = imageUrl;
      link.target = '_blank';
      link.download = `chat-image-${Date.now()}.jpg`;
      
      // Extract filename from URL or use timestamp
      const urlParts = imageUrl.split('/');
      const filename = urlParts[urlParts.length - 1].split('.')[0] || `chat-image-${Date.now()}`;
      link.download = `${filename}.jpg`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading image:', error);
      // Fallback: open in new tab
      window.open(imageUrl, '_blank');
    }
  };

  const formatTimestamp = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 p-4"
      onClick={onClose}
    >
      <div 
        className="relative max-w-4xl max-h-full w-full h-full flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with controls */}
        <div className={`flex justify-between items-center p-4 ${
          isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
        } rounded-t-lg`}>
          <div className="flex items-center space-x-3">
            {senderName && (
              <span className="font-medium">{senderName}</span>
            )}
            {timestamp && (
              <span className={`text-sm ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                {formatTimestamp(timestamp)}
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Download button */}
            <button
              onClick={handleDownload}
              className={`p-2 rounded-full transition-colors ${
                isDarkMode 
                  ? 'hover:bg-gray-700 text-gray-300' 
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
              title="Download image"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" 
                />
              </svg>
            </button>
            
            {/* Close button */}
            <button
              onClick={onClose}
              className={`p-2 rounded-full transition-colors ${
                isDarkMode 
                  ? 'hover:bg-gray-700 text-gray-300' 
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
              title="Close"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M6 18L18 6M6 6l12 12" 
                />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Image container */}
        <div className="flex-1 flex items-center justify-center overflow-hidden rounded-b-lg">
          <img
            src={imageUrl}
            alt="Full size image"
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
        
        {/* Instructions */}
        <div className={`absolute bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-full ${
          isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
        } bg-opacity-90 text-sm`}>
          Press ESC or click outside to close • Click download to save
        </div>
      </div>
    </div>
  );
};

export default ImageModal;
