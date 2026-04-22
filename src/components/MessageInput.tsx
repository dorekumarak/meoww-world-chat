import React, { useState, useRef, useEffect } from 'react';
import { sendMessage, sendImageMessage, setTypingIndicator } from '../firebase';
import { setTypingIndicatorOptimized } from '../utils/firebaseOptimization';
import { useAuth } from '../context/AuthContext';
import EmojiPickerComponent from './EmojiPicker';
import ImageUpload from './ImageUpload';

interface MessageInputProps {
  isDarkMode: boolean;
  chatId: string;
}

const MessageInput: React.FC<MessageInputProps> = ({ isDarkMode, chatId }) => {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const emojiButtonRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && user && chatId) {
      try {
        await sendMessage(chatId, message.trim(), user.id, user.name);
        setMessage('');
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMessage = e.target.value;
    setMessage(newMessage);
    
    // Show typing indicator when user starts typing
    if (newMessage.trim() && !isTyping && chatId) {
      setIsTyping(true);
      setTypingIndicatorOptimized(chatId, user?.id || '', user?.name || '', true);
    }
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Hide typing indicator after user stops typing for 1 second
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      if (chatId) {
        setTypingIndicatorOptimized(chatId, user?.id || '', user?.name || '', false);
      }
    }, 1000);
  };

  const handleEmojiSelect = (emoji: string) => {
    const newMessage = message + emoji;
    setMessage(newMessage);
    setShowEmojiPicker(false);
    
    // Focus input after emoji selection
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const toggleEmojiPicker = () => {
    setShowEmojiPicker(!showEmojiPicker);
  };

  const closeEmojiPicker = () => {
    setShowEmojiPicker(false);
  };

  const handleImageUpload = async (imageUrl: string) => {
    if (!user || !chatId) return;

    try {
      await sendImageMessage(chatId, imageUrl, user.id, user.name);
    } catch (error) {
      console.error('Error sending image message:', error);
    }
  };

  return (
    <div className={`border-t ${isDarkMode ? 'bg-whatsapp-dark-panel border-gray-700' : 'bg-white border-gray-200'}`}>
      <form onSubmit={handleSubmit} className="flex items-center p-4 space-x-2">
        <ImageUpload 
          onImageUpload={handleImageUpload}
          isDarkMode={isDarkMode}
        />

        <button
          type="button"
          ref={emojiButtonRef}
          onClick={toggleEmojiPicker}
          className={`p-2 rounded-full transition-colors ${
            showEmojiPicker 
              ? isDarkMode 
                ? 'bg-whatsapp-dark-hover text-green-500' 
                : 'bg-gray-100 text-green-500'
              : isDarkMode 
                ? 'hover:bg-whatsapp-dark-hover text-gray-300' 
                : 'hover:bg-gray-100 text-gray-600'
          }`}
          aria-label="Emoji"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>

        <div className="flex-1 relative">
          <input
            ref={inputRef}
            type="text"
            value={message}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className={`w-full px-4 py-2 rounded-full focus:outline-none focus-ring-2 focus:ring-whatsapp-green transition-all duration-200 ${
              isDarkMode
                ? 'bg-whatsapp-dark-hover text-white placeholder-gray-400'
                : 'bg-gray-100 text-gray-900 placeholder-gray-500'
            }`}
          />
        </div>

        <button
          type="submit"
          disabled={!message.trim()}
          className={`p-2 rounded-full transition-colors ${
            message.trim()
              ? 'bg-whatsapp-green text-white hover:bg-green-600'
              : isDarkMode
              ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
          aria-label="Send message"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </form>
      
      {showEmojiPicker && (
        <EmojiPickerComponent
          onEmojiSelect={handleEmojiSelect}
          onClose={closeEmojiPicker}
          isDarkMode={isDarkMode}
          buttonRef={emojiButtonRef}
        />
      )}
    </div>
  );
};

export default MessageInput;
