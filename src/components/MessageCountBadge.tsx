// Message count badge for unread messages
import React from 'react';
import { useMessageCounter } from '../utils/messageCounter';

interface MessageCountBadgeProps {
  isDarkMode: boolean;
}

const MessageCountBadge: React.FC<MessageCountBadgeProps> = ({ isDarkMode }) => {
  const { unreadCount } = useMessageCounter();

  if (unreadCount === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className={`relative inline-flex items-center justify-center w-12 h-12 rounded-full ${
        isDarkMode ? 'bg-red-600' : 'bg-red-500'
      } text-white shadow-lg animate-pulse`}>
        <span className="text-sm font-bold">{unreadCount > 99 ? '99+' : unreadCount}</span>
        
        {/* Tooltip */}
        <div className={`absolute bottom-full right-0 mb-2 px-3 py-1 text-xs rounded ${
          isDarkMode ? 'bg-gray-800 text-white' : 'bg-gray-900 text-white'
        } opacity-0 hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap`}>
          {unreadCount} unread message{unreadCount !== 1 ? 's' : ''}
        </div>
      </div>
    </div>
  );
};

export default MessageCountBadge;
