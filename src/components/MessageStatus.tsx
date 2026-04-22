import React from 'react';

interface MessageStatusProps {
  status?: 'sent' | 'delivered' | 'seen';
  isOwnMessage: boolean;
  isDarkMode: boolean;
}

const MessageStatus: React.FC<MessageStatusProps> = ({ status, isOwnMessage, isDarkMode }) => {
  if (!isOwnMessage || !status) return null;

  const getStatusIcon = () => {
    switch (status) {
      case 'sent':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
          </svg>
        );
      case 'delivered':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
            <path d="M17 7a8 8 0 00-4-6.932V0a10 10 0 015.5 9.5A10 10 0 0117 17v-10z" opacity="0.7" transform="translate(-2 0)" />
          </svg>
        );
      case 'seen':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
            <path d="M17 7a8 8 0 00-4-6.932V0a10 10 0 015.5 9.5A10 10 0 0117 17v-10z" opacity="0.7" transform="translate(-2 0)" />
            <path d="M17 7a8 8 0 00-4-6.932V0a10 10 0 015.5 9.5A10 10 0 0117 17v-10z" opacity="0.7" transform="translate(-6 0)" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'sent':
        return isDarkMode ? 'text-gray-400' : 'text-gray-500';
      case 'delivered':
        return isDarkMode ? 'text-gray-300' : 'text-gray-600';
      case 'seen':
        return '#53BDEB'; // WhatsApp blue color
      default:
        return isDarkMode ? 'text-gray-400' : 'text-gray-500';
    }
  };

  return (
    <div className={`flex items-center ${getStatusColor()}`} style={{ color: status === 'seen' ? '#53BDEB' : undefined }}>
      {getStatusIcon()}
    </div>
  );
};

export default MessageStatus;
