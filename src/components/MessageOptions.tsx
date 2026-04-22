import React from 'react';

interface MessageOptionsProps {
  isVisible: boolean;
  onClose: () => void;
  onDeleteForMe: () => void;
  onDeleteForEveryone: () => void;
  canDeleteForEveryone: boolean;
  isDarkMode: boolean;
  position: { x: number; y: number };
}

const MessageOptions: React.FC<MessageOptionsProps> = ({
  isVisible,
  onClose,
  onDeleteForMe,
  onDeleteForEveryone,
  canDeleteForEveryone,
  isDarkMode,
  position
}) => {
  if (!isVisible) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 z-40" 
        onClick={onClose}
      />
      
      {/* Options Menu */}
      <div 
        className={`absolute z-50 rounded-lg shadow-xl border min-w-48 ${
          isDarkMode 
            ? 'bg-gray-800 border-gray-700 text-white' 
            : 'bg-white border-gray-200 text-gray-900'
        }`}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`
        }}
      >
        {/* Delete for Me */}
        <button
          onClick={() => {
            onDeleteForMe();
            onClose();
          }}
          className={`w-full text-left px-4 py-3 hover:bg-opacity-80 transition-colors flex items-center space-x-3 ${
            isDarkMode 
              ? 'hover:bg-gray-700' 
              : 'hover:bg-gray-100'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          <span>Delete for me</span>
        </button>
        
        {/* Delete for Everyone - only for sender */}
        {canDeleteForEveryone && (
          <>
            <div className={`border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`} />
            <button
              onClick={() => {
                onDeleteForEveryone();
                onClose();
              }}
              className={`w-full text-left px-4 py-3 hover:bg-opacity-80 transition-colors flex items-center space-x-3 text-red-500 ${
                isDarkMode 
                  ? 'hover:bg-gray-700' 
                  : 'hover:bg-gray-100'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span>Delete for everyone</span>
            </button>
          </>
        )}
        
        {/* Cancel */}
        <div className={`border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`} />
        <button
          onClick={onClose}
          className={`w-full text-left px-4 py-3 hover:bg-opacity-80 transition-colors ${
            isDarkMode 
              ? 'hover:bg-gray-700' 
              : 'hover:bg-gray-100'
          }`}
        >
          Cancel
        </button>
      </div>
    </>
  );
};

export default MessageOptions;
