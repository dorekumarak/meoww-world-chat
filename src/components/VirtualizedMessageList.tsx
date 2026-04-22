// Virtual scrolling for ultra-fast performance with long chat history
import React, { useMemo, useCallback, useRef, useEffect, useState } from 'react';

interface VirtualizedMessageListProps {
  messages: any[];
  isDarkMode: boolean;
  onMessageClick?: (message: any) => void;
  onImageClick?: (imageUrl: string, senderName?: string, timestamp?: any) => void;
}

const ITEM_HEIGHT = 80; // Estimated height of each message
const BUFFER_SIZE = 5; // Number of items to render outside visible area

const VirtualizedMessageList: React.FC<VirtualizedMessageListProps> = ({ 
  messages, 
  isDarkMode, 
  onMessageClick, 
  onImageClick 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(400);

  // Calculate visible range
  const visibleRange = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - BUFFER_SIZE);
    const endIndex = Math.min(
      messages.length - 1,
      Math.ceil((scrollTop + containerHeight) / ITEM_HEIGHT) + BUFFER_SIZE
    );
    return { startIndex, endIndex };
  }, [scrollTop, containerHeight, messages.length]);

  // Get visible messages
  const visibleMessages = useMemo(() => {
    return messages.slice(visibleRange.startIndex, visibleRange.endIndex + 1);
  }, [messages, visibleRange]);

  // Handle scroll with debouncing
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const newScrollTop = e.currentTarget.scrollTop;
    setScrollTop(newScrollTop);
  }, []);

  // Update container height
  useEffect(() => {
    if (containerRef.current) {
      const height = containerRef.current.clientHeight;
      setContainerHeight(height);
    }
  }, []);

  // Render message with optimized styling
  const renderMessage = useCallback((message: any, index: number) => {
    const isOwn = message.sender === 'me';
    const messageTime = message.timestamp?.toDate?.() || new Date(message.timestamp);
    
    return (
      <div 
        key={message.id}
        style={{
          position: 'absolute',
          top: `${index * ITEM_HEIGHT}px`,
          width: '100%',
          height: `${ITEM_HEIGHT}px`
        }}
        className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4 px-4`}
      >
        <div className={`max-w-xs lg:max-w-md ${isOwn ? 'order-2' : 'order-1'}`}>
          <div className={`inline-block px-4 py-2 rounded-lg ${
            isOwn 
              ? 'bg-green-500 text-white' 
              : isDarkMode 
                ? 'bg-gray-700 text-white' 
                : 'bg-white text-gray-800'
          } shadow-md`}>
            
            {message.imageUrl ? (
              <img 
                src={message.imageUrl}
                alt="Image"
                className="max-w-xs rounded cursor-pointer hover:opacity-90 transition-opacity"
                loading="lazy"
                onClick={() => onImageClick?.(message.imageUrl, message.senderName, message.timestamp)}
                style={{ maxHeight: '200px' }}
              />
            ) : (
              <p className="text-sm break-words">{message.text}</p>
            )}
            
            <div className="text-xs mt-1 opacity-70">
              {messageTime.toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }, [isDarkMode, onImageClick]);

  return (
    <div 
      ref={containerRef}
      className={`relative overflow-y-auto ${isDarkMode ? 'bg-whatsapp-dark-bg' : 'bg-gray-100'}`}
      style={{ height: '400px' }}
      onScroll={handleScroll}
    >
      {/* Top spacer */}
      <div style={{ height: `${visibleRange.startIndex * ITEM_HEIGHT}px` }} />
      
      {/* Visible messages */}
      {visibleMessages.map((message, index) => {
        const actualIndex = visibleRange.startIndex + index;
        return renderMessage(message, actualIndex);
      })}
      
      {/* Bottom spacer */}
      <div style={{ 
        height: `${(messages.length - visibleRange.endIndex - 1) * ITEM_HEIGHT}px` 
      }} />
    </div>
  );
};

export default VirtualizedMessageList;
