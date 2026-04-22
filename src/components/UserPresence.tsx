import React from 'react';
import type { UserPresence } from '../firebase';

interface UserPresenceProps {
  presence: UserPresence | null;
  isDarkMode: boolean;
}

const UserPresenceComponent: React.FC<UserPresenceProps> = ({ presence, isDarkMode }) => {
  if (!presence) return null;

  const formatLastSeen = (lastSeen: any) => {
    if (!lastSeen) return '';
    const date = lastSeen.toDate ? lastSeen.toDate() : new Date(lastSeen);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) {
      return 'last seen just now';
    } else if (diffMins < 60) {
      return `last seen ${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `last seen ${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      return `last seen ${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else {
      return `last seen on ${date.toLocaleDateString()}`;
    }
  };

  return (
    <div className="flex items-center space-x-2">
      {/* Online status indicator */}
      <div className="relative">
        <div 
          className={`w-3 h-3 rounded-full border-2 ${
            presence.isOnline 
              ? 'bg-green-500 border-white' 
              : 'bg-gray-400 border-white'
          }`}
        />
        {presence.isOnline && (
          <div className="absolute inset-0 rounded-full bg-green-500 animate-ping" />
        )}
      </div>
      
      {/* Status text */}
      <div className={`text-sm ${
        isDarkMode ? 'text-gray-300' : 'text-gray-600'
      }`}>
        {presence.isOnline ? (
          <span className="flex items-center space-x-1">
            <span>Online</span>
          </span>
        ) : (
          <span>{formatLastSeen(presence.lastSeen)}</span>
        )}
      </div>
    </div>
  );
};

export default UserPresenceComponent;
