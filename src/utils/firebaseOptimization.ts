// Firebase optimization for ultra-fast performance and low data usage
import { doc, getDoc, updateDoc, arrayUnion, serverTimestamp, collection, query, orderBy, onSnapshot, limit, where, writeBatch } from 'firebase/firestore';
import { db } from '../firebase';

// Optimized message subscription with caching
export const subscribeToMessagesOptimized = (
  chatId: string,
  callback: (messages: any[]) => void,
  lastMessageId?: string
) => {
  const metadataRef = doc(db, 'chatMetadata', chatId);
  let unsubscribe: (() => void) | null = null;
  
  // Get metadata first to check for new messages
  const setupSubscription = async () => {
    const docSnapshot = await getDoc(metadataRef);
    const metadata = docSnapshot.data();
    const lastSeenMessageId = metadata?.lastSeenMessageId;
    
    // Only fetch new messages if there are any
    if (lastSeenMessageId && lastSeenMessageId !== lastMessageId) {
      unsubscribe = fetchNewMessages(chatId, lastSeenMessageId, callback, metadata, metadataRef);
    } else {
      // Initial load or no new messages
      unsubscribe = fetchAllMessages(chatId, callback, metadata);
    }
  };
  
  setupSubscription();
  
  // Return unsubscribe function
  return () => {
    if (unsubscribe) {
      unsubscribe();
    }
  };
};

// Fetch only new messages
const fetchNewMessages = (
  chatId: string,
  lastSeenMessageId: string,
  callback: (messages: any[]) => void,
  metadata: any,
  metadataRef: any
) => {
  const messagesRef = collection(db, 'chats', chatId, 'messages');
  const q = query(
    messagesRef,
    where('id', '>', lastSeenMessageId),
    orderBy('timestamp', 'asc'),
    limit(20) // Limit to reduce data usage
  );
  
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const newMessages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    callback(newMessages);
    
    // Update metadata
    if (newMessages.length > 0) {
      const lastMessage = newMessages[newMessages.length - 1];
      updateDoc(metadataRef, {
        ...metadata,
        lastSeenMessageId: lastMessage.id,
        lastSyncTime: serverTimestamp()
      });
    }
  });
  
  return unsubscribe;
};

// Fetch all messages with pagination
const fetchAllMessages = (
  chatId: string,
  callback: (messages: any[]) => void,
  metadata: any
) => {
  const messagesRef = collection(db, 'chats', chatId, 'messages');
  const q = query(
    messagesRef,
    orderBy('timestamp', 'desc'),
    limit(30) // Limit initial load for performance
  );
  
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    callback(messages);
  });
  
  return unsubscribe;
};

// Batch update message status for efficiency
export const batchUpdateMessageStatus = async (
  updates: Array<{ messageId: string; chatId: string; status: string; userId: string }>
) => {
  const batch = writeBatch(db);
  
  updates.forEach(update => {
    const messageRef = doc(db, 'chats', update.chatId, 'messages', update.messageId);
    batch.update(messageRef, {
      status: update.status,
      readBy: arrayUnion(update.userId)
    });
  });
  
  await batch.commit();
};

// Optimized typing indicator with debouncing
export const setTypingIndicatorOptimized = (() => {
  let timeoutId: NodeJS.Timeout | null = null;
  
  return (chatId: string, userId: string, userName: string, isTyping: boolean) => {
    // Clear existing timeout
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    // Debounce to reduce Firebase writes
    timeoutId = setTimeout(async () => {
      const typingRef = doc(db, 'chats', chatId, 'typing');
      try {
        if (isTyping) {
          await updateDoc(typingRef, {
            [userId]: {
              userName,
              timestamp: serverTimestamp()
            }
          });
        } else {
          await updateDoc(typingRef, {
            [userId]: null
          });
        }
      } catch (error) {
        console.error('Typing indicator update failed:', error);
      }
    }, 300); // 300ms debounce
  };
})();

// Clean up old typing indicators
export const cleanupOldTypingIndicators = async (chatId: string) => {
  const typingRef = doc(db, 'chats', chatId, 'typing');
  const typingDoc = await getDoc(typingRef);
  
  if (typingDoc.exists()) {
    const typingData = typingDoc.data();
    const now = Date.now();
    const fiveMinutesAgo = now - (5 * 60 * 1000);
    
    // Remove typing indicators older than 5 minutes
    const updates: any = {};
    Object.keys(typingData).forEach(userId => {
      if (typingData[userId] && typingData[userId].timestamp?.toDate) {
        const timestamp = typingData[userId].timestamp.toDate().getTime();
        if (timestamp < fiveMinutesAgo) {
          updates[userId] = null;
        }
      }
    });
    
    if (Object.keys(updates).length > 0) {
      await updateDoc(typingRef, updates);
    }
  }
};
