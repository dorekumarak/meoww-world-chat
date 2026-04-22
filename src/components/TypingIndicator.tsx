import React from 'react';

interface TypingIndicatorProps {
  typingUsers: any[];
  isDarkMode: boolean;
  currentUser?: { id: string; name: string };
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({ 
  typingUsers, 
  isDarkMode, 
  currentUser 
}) => {
  // Filter out current user from typing indicators
  const otherUsersTyping = typingUsers.filter(user => user.userId !== currentUser?.id);
  
  if (otherUsersTyping.length === 0) return null;

  // Get unique user names
  const typingNames = Array.from(new Set(otherUsersTyping.map(user => user.userName)));

  const getTypingText = () => {
    if (typingNames.length === 1) {
      return `${typingNames[0]} is typing...`;
    } else if (typingNames.length === 2) {
      return `${typingNames[0]} and ${typingNames[1]} are typing...`;
    } else {
      return 'Several people are typing...';
    }
  };

  return (
    <div className={`px-4 py-2 text-sm typing-indicator animate-fade-in ${
      isDarkMode ? 'text-gray-400' : 'text-gray-500'
    }`}>
      <div className="flex items-center space-x-2">
        {/* Typing dots animation */}
        <div className="typing-dots">
          <div className="typing-dot"></div>
          <div className="typing-dot"></div>
          <div className="typing-dot"></div>
        </div>
        
        {/* Typing text */}
        <span className="italic">
          {getTypingText()}
        </span>
      </div>
    </div>
  );
};

export default TypingIndicator;
