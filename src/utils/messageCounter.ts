// Message counter for unread messages badge
import React, { useState, useEffect } from 'react';

class MessageCounter {
  private unreadCount: number = 0;
  private lastReadMessageId: string | null = null;
  private listeners: ((count: number) => void)[] = [];

  // Add listener for count changes
  addListener(listener: (count: number) => void) {
    this.listeners.push(listener);
    // Immediately call with current count
    listener(this.unreadCount);
  }

  // Remove listener
  removeListener(listener: (count: number) => void) {
    const index = this.listeners.indexOf(listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  // Notify all listeners
  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.unreadCount));
  }

  // Increment unread count
  increment() {
    this.unreadCount++;
    this.notifyListeners();
  }

  // Decrement unread count
  decrement() {
    if (this.unreadCount > 0) {
      this.unreadCount--;
      this.notifyListeners();
    }
  }

  // Reset count to zero
  reset() {
    this.unreadCount = 0;
    this.notifyListeners();
  }

  // Set count to specific value
  setCount(count: number) {
    this.unreadCount = Math.max(0, count);
    this.notifyListeners();
  }

  // Get current count
  getCount(): number {
    return this.unreadCount;
  }

  // Mark message as read
  markAsRead(messageId: string) {
    this.lastReadMessageId = messageId;
    this.reset();
  }

  // Check if message is newer than last read
  isNewMessage(messageId: string): boolean {
    if (!this.lastReadMessageId) return true;
    return messageId !== this.lastReadMessageId;
  }
}

// Global message counter instance
export const messageCounter = new MessageCounter();

// React hook for message counter
export const useMessageCounter = () => {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Add listener
    messageCounter.addListener(setUnreadCount);

    // Cleanup
    return () => {
      messageCounter.removeListener(setUnreadCount);
    };
  }, []);

  return {
    unreadCount,
    increment: messageCounter.increment.bind(messageCounter),
    decrement: messageCounter.decrement.bind(messageCounter),
    reset: messageCounter.reset.bind(messageCounter),
    setCount: messageCounter.setCount.bind(messageCounter),
    markAsRead: messageCounter.markAsRead.bind(messageCounter),
    isNewMessage: messageCounter.isNewMessage.bind(messageCounter)
  };
};
