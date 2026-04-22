import React, { useState, useEffect } from 'react';
import { Contact } from '../types';
import { subscribeToUserPresence, type UserPresence, clearChat } from '../firebase';
import UserPresenceComponent from './UserPresence';
import ClearChatModal from './ClearChatModal';

interface ChatHeaderProps {
  contact: Contact;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onLogout: () => void;
  currentUser?: { name: string; email: string };
  chatId: string;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ contact, isDarkMode, onToggleDarkMode, onLogout, currentUser, chatId }) => {
  const [userPresence, setUserPresence] = useState<UserPresence | null>(null);
  const [showClearModal, setShowClearModal] = useState(false);

  useEffect(() => {
    if (!contact?.id) return;
    
    const unsubscribe = subscribeToUserPresence(contact.id, (presence) => {
      setUserPresence(presence);
    });
    return unsubscribe;
  }, [contact]);

  const handleClearChat = () => {
    setShowClearModal(true);
  };

  const handleConfirmClearChat = async () => {
    try {
      await clearChat(chatId);
      setShowClearModal(false);
    } catch (error) {
      console.error('Error clearing chat:', error);
    }
  };

  const handleCloseClearModal = () => {
    setShowClearModal(false);
  };

  return (
    <div className={`flex items-center justify-between p-4 border-b ${isDarkMode ? 'bg-whatsapp-dark-panel border-gray-700' : 'bg-white border-gray-200'}`}>
      <div className="flex items-center space-x-3">
        <div className="relative">
          <img
            src={contact.avatar}
            alt={contact.name}
            className="w-12 h-12 rounded-full object-cover interactive-element"
          />
          {contact.isOnline && (
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800 animate-pulse-slow"></div>
          )}
        </div>
        <div>
          <h2 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {contact.name}
          </h2>
          <UserPresenceComponent 
            presence={userPresence} 
            isDarkMode={isDarkMode} 
          />
        </div>
      </div>
      
      <div className="flex items-center space-x-3">
        <button
          onClick={onToggleDarkMode}
          className={`p-2 rounded-full transition-colors interactive-element ${isDarkMode ? 'hover:bg-whatsapp-dark-hover text-gray-300' : 'hover:bg-gray-100 text-gray-600'}`}
          aria-label="Toggle dark mode"
        >
          {isDarkMode ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 0118.646 3.354l-5.646-5.646a9 9 0 00-12.728 0l-5.646 5.646A9 9 0 0015.354 15.354zm-5.646-9.293a7 7 0 00-9.865 9.865v5.828a7 7 0 009.865-9.865z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-9m9 9H3m9-9v9a9 9 0 019 9v9a9 9 0 01-9-9z" />
            </svg>
          )}
        </button>
        
        <button
          onClick={handleClearChat}
          className={`btn-primary p-2 rounded-full transition-all duration-200 interactive-element ${isDarkMode ? 'hover:bg-whatsapp-dark-hover text-gray-300' : 'hover:bg-gray-100 text-gray-600'}`}
          aria-label="Clear chat"
          title="Clear chat history"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
      
      <div className="flex items-center space-x-1">
        {currentUser && (
          <div className="hidden sm:block text-right mr-2">
            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Logged in as
            </p>
            <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {currentUser.name}
            </p>
          </div>
        )}
        
        <button
          onClick={onLogout}
          className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-whatsapp-dark-hover text-gray-300' : 'hover:bg-gray-100 text-gray-600'}`}
          aria-label="Logout"
          title="Logout"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
        
        <button
          className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-whatsapp-dark-hover text-gray-300' : 'hover:bg-gray-100 text-gray-600'}`}
          aria-label="More options"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </button>
      </div>
      
      {/* Clear Chat Modal */}
      <ClearChatModal
        isVisible={showClearModal}
        onClose={handleCloseClearModal}
        onConfirm={handleConfirmClearChat}
        isDarkMode={isDarkMode}
      />
    </div>
  );
};

export default ChatHeader;
