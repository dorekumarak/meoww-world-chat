import React, { useEffect, useRef, useState } from 'react';
import { Message } from '../types';
import { subscribeToMessages, FirestoreMessage, markMessagesAsDelivered, markMessagesAsSeen, deleteMessageForMe, deleteMessageForEveryone, subscribeToTypingIndicators } from '../firebase';
import { subscribeToMessagesOptimized, cleanupOldTypingIndicators } from '../utils/firebaseOptimization';
import { useMessageCounter } from '../utils/messageCounter';
import { useAuth } from '../context/AuthContext';
import ImageModal from './ImageModal';
import MessageStatus from './MessageStatus';
import MessageOptions from './MessageOptions';
import TypingIndicator from './TypingIndicator';

interface MessageAreaProps {
  isDarkMode: boolean;
  chatId: string;
}

const MessageArea: React.FC<MessageAreaProps> = ({ isDarkMode, chatId }) => {
  const { user } = useAuth();
  const { increment, reset, markAsRead, isNewMessage } = useMessageCounter();
  const [messages, setMessages] = useState<FirestoreMessage[]>([]);
  const [typingUsers, setTypingUsers] = useState<any[]>([]);
  const [selectedImage, setSelectedImage] = useState<{
    url: string;
    senderName?: string;
    timestamp?: any;
  } | null>(null);
  const [messageOptions, setMessageOptions] = useState<{
    messageId: string;
    position: { x: number; y: number };
  } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!user || !chatId) return;

    // Get last message ID for optimized queries
    const lastMessageId = messages.length > 0 ? messages[messages.length - 1].id : undefined;

    const messagesUnsubscribe = subscribeToMessagesOptimized(chatId, (firestoreMessages) => {
      // Filter out deleted messages for current user
      const visibleMessages = firestoreMessages.filter(message => {
        const isDeletedForMe = message.deletedFor?.includes(user.id);
        const isDeletedForEveryone = message.deletedForEveryone;
        return !isDeletedForMe && !isDeletedForEveryone;
      });
      
      // Check for new messages and increment counter
      visibleMessages.forEach(message => {
        if (message.sender !== user.id && isNewMessage(message.id)) {
          increment();
        }
      });
      
      setMessages(visibleMessages);
      
      // Mark other users' messages as delivered
      markMessagesAsDelivered(chatId, visibleMessages, user.id);
      
      // Mark messages as seen when user is active
      setTimeout(() => {
        markMessagesAsSeen(chatId, visibleMessages, user.id);
        reset(); // Reset counter when messages are seen
      }, 2000); // Simulate user reading messages
    }, lastMessageId);

    const typingUnsubscribe = subscribeToTypingIndicators(chatId, (typingUsers) => {
      setTypingUsers(typingUsers);
    });

    // Clean up old typing indicators periodically
    const cleanupInterval = setInterval(() => {
      cleanupOldTypingIndicators(chatId);
    }, 60000); // Every minute

    return () => {
      messagesUnsubscribe();
      typingUnsubscribe();
      clearInterval(cleanupInterval);
    };
  }, [user, chatId]);

  const formatTime = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleImageClick = (imageUrl: string, senderName?: string, timestamp?: any) => {
    setSelectedImage({
      url: imageUrl,
      senderName,
      timestamp
    });
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  const handleMessageLongPress = (messageId: string, event: React.MouseEvent | React.TouchEvent) => {
    event.preventDefault();
    
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    setMessageOptions({
      messageId,
      position: {
        x: rect.left,
        y: rect.bottom + 5
      }
    });
  };

  const closeMessageOptions = () => {
    setMessageOptions(null);
  };

  const handleDeleteForMe = async () => {
    if (!messageOptions) return;
    
    try {
      const chatId = 'demo-chat';
      await deleteMessageForMe(chatId, messageOptions.messageId, user?.id || '');
    } catch (error) {
      console.error('Error deleting message for me:', error);
    }
  };

  const handleDeleteForEveryone = async () => {
    if (!messageOptions) return;
    
    try {
      const chatId = 'demo-chat';
      await deleteMessageForEveryone(chatId, messageOptions.messageId, user?.id || '');
    } catch (error) {
      console.error('Error deleting message for everyone:', error);
    }
  };

  const getStatusIcon = (status?: string) => {
    if (!status) return null;
    
    switch (status) {
      case 'sent':
        return (
          <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
          </svg>
        );
      case 'delivered':
        return (
          <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
            <path d="M14.707 7.293a1 1 0 00-1.414 0L10 10.586 8.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4a1 1 0 000-1.414z" transform="translate(0, 2)" />
          </svg>
        );
      case 'read':
        return (
          <svg className="w-3 h-3 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
            <path d="M14.707 7.293a1 1 0 00-1.414 0L10 10.586 8.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4a1 1 0 000-1.414z" transform="translate(0, 2)" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`flex-1 overflow-y-auto custom-scrollbar p-4 ${isDarkMode ? 'bg-whatsapp-dark-bg' : 'bg-whatsapp-gray'}`}>
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex mb-4 ${message.sender === user?.id ? 'justify-end' : 'justify-start'} animate-fade-in`}
        >
          <div
            className={`message-bubble max-w-xs lg:max-w-md rounded-2xl overflow-hidden shadow-sm interactive-element ${
              message.sender === user?.id
                ? isDarkMode
                  ? 'bg-whatsapp-dark-green text-white'
                  : 'bg-whatsapp-green text-white'
                : isDarkMode
                ? 'bg-whatsapp-dark-panel text-white'
                : 'bg-white text-gray-900'
            }`}
            onContextMenu={(e) => handleMessageLongPress(message.id, e)}
            onTouchStart={(e) => {
              // Long press for mobile
              const touchTimer = setTimeout(() => {
                handleMessageLongPress(message.id, e);
              }, 500);
              
              const clearTimer = () => {
                clearTimeout(touchTimer);
                document.removeEventListener('touchend', clearTimer);
                document.removeEventListener('touchcancel', clearTimer);
              };
              
              document.addEventListener('touchend', clearTimer);
              document.addEventListener('touchcancel', clearTimer);
            }}
          >
            {/* Image content */}
            {message.type === 'image' && message.imageUrl && (
              <div className="relative">
                <img
                  src={message.imageUrl}
                  alt="Shared image"
                  className="w-full h-auto max-h-64 object-cover cursor-pointer"
                  onClick={() => message.imageUrl && handleImageClick(message.imageUrl, message.senderName, message.timestamp)}
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-2">
                  <p className="text-white text-xs">Click to view full size & download</p>
                </div>
              </div>
            )}
            
            {/* Text content */}
            {message.type === 'text' && message.text && (
              <div className="px-4 py-2">
                <p className="text-sm break-words">{message.text}</p>
              </div>
            )}
            
            {/* Timestamp for both message types */}
            <div className={`px-2 pb-1 ${message.type === 'image' ? 'pt-1' : ''}`}>
              <div className={`flex items-center justify-end space-x-1 ${message.sender === user?.id ? 'flex-row-reverse space-x-reverse' : ''}`}>
                <span className={`text-xs ${message.sender === user?.id ? 'text-white/70' : isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {formatTime(message.timestamp)}
                </span>
                {/* Message status ticks for own messages */}
                <MessageStatus 
                  status={message.status} 
                  isOwnMessage={message.sender === user?.id}
                  isDarkMode={isDarkMode}
                />
              </div>
            </div>
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
      
      {/* Typing Indicator */}
      <TypingIndicator
        typingUsers={typingUsers}
        isDarkMode={isDarkMode}
        currentUser={user || undefined}
      />
      
      {/* Message Options */}
      {messageOptions && (
        <MessageOptions
          isVisible={!!messageOptions}
          onClose={closeMessageOptions}
          onDeleteForMe={handleDeleteForMe}
          onDeleteForEveryone={handleDeleteForEveryone}
          canDeleteForEveryone={messages.some(m => m.id === messageOptions.messageId && m.sender === user?.id)}
          isDarkMode={isDarkMode}
          position={messageOptions.position}
        />
      )}
      
      {/* Image Modal */}
      {selectedImage && (
        <ImageModal
          imageUrl={selectedImage.url}
          isOpen={!!selectedImage}
          onClose={closeModal}
          isDarkMode={isDarkMode}
          senderName={selectedImage.senderName}
          timestamp={selectedImage.timestamp}
        />
      )}
    </div>
  );
};

export default MessageArea;
