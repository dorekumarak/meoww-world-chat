import React from 'react';

interface ClearChatModalProps {
  isVisible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDarkMode: boolean;
}

const ClearChatModal: React.FC<ClearChatModalProps> = ({
  isVisible,
  onClose,
  onConfirm,
  isDarkMode
}) => {
  if (!isVisible) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
        onClick={onClose}
      >
        {/* Modal Content */}
        <div 
          className={`relative max-w-sm w-full mx-4 p-6 rounded-lg shadow-xl ${
            isDarkMode 
              ? 'bg-gray-800 text-white' 
              : 'bg-white text-gray-900'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-center mb-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              isDarkMode ? 'bg-red-900' : 'bg-red-100'
            }`}>
              <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
          </div>
          
          {/* Title */}
          <h3 className={`text-lg font-semibold text-center mb-2 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Clear Chat History
          </h3>
          
          {/* Description */}
          <p className={`text-center mb-6 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Are you sure you want to delete all messages in this chat? 
            This action cannot be undone.
          </p>
          
          {/* Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                isDarkMode 
                  ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
              }`}
            >
              Cancel
            </button>
            
            <button
              onClick={onConfirm}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                isDarkMode 
                  ? 'bg-red-600 hover:bg-red-700 text-white' 
                  : 'bg-red-500 hover:bg-red-600 text-white'
              }`}
            >
              Clear Chat
            </button>
          </div>
          
          {/* Warning Icon */}
          <div className="absolute top-4 right-4">
            <svg className={`w-5 h-5 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        </div>
      </div>
    </>
  );
};

export default ClearChatModal;
