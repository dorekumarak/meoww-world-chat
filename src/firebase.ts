import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, doc, setDoc, getDoc, getDocs, updateDoc, arrayUnion, where, writeBatch, getDocsFromServer } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB6kWhze3sc0PJYaDaIdIha0awtucnsVm4",
  authDomain: "meoww-world.firebaseapp.com",
  projectId: "meoww-world",
  storageBucket: "meoww-world.firebasestorage.app",
  messagingSenderId: "467624201544",
  appId: "1:467624201544:web:aa03034ee1dedbe22fb77d",
  measurementId: "G-XJYB5HDN6R"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Authentication functions
export const loginUser = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    throw error;
  }
};

export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// Generate private chat ID for two users
export const generateChatId = (user1Id: string, user2Id: string): string => {
  const sortedIds = [user1Id, user2Id].sort();
  return `chat-${sortedIds[0]}-${sortedIds[1]}`;
};

// Fetch all users from Firebase Auth (simplified version)
export const fetchAllUsers = async (): Promise<any[]> => {
  // Since client-side Firebase Auth doesn't have a direct way to list all users,
  // we'll use a workaround by storing user profiles in Firestore
  const usersRef = collection(db, 'users');
  const snapshot = await getDocs(usersRef);
  return snapshot.docs.map(doc => ({
    uid: doc.id,
    email: doc.data().email,
    displayName: doc.data().name || doc.data().email?.split('@')[0]
  }));
};

// Create or update user profile in Firestore
export const ensureUserDocument = async (user: User) => {
  const userRef = doc(db, 'users', user.uid);
  const userDoc = await getDoc(userRef);
  
  if (!userDoc.exists()) {
    await setDoc(userRef, {
      email: user.email,
      name: user.displayName || user.email?.split('@')[0] || 'User',
      createdAt: serverTimestamp(),
      lastSeen: serverTimestamp()
    });
  } else {
    await updateDoc(userRef, {
      lastSeen: serverTimestamp()
    });
  }
};

// Firestore functions for messages
export interface FirestoreMessage {
  id: string;
  text?: string;
  imageUrl?: string;
  sender: string;
  senderName: string;
  timestamp: any;
  createdAt: any;
  type: 'text' | 'image';
  status?: 'sent' | 'delivered' | 'seen';
  readBy?: string[]; // Array of user IDs who have read the message
  deletedFor?: string[]; // Array of user IDs who deleted the message
  deletedForEveryone?: boolean; // Whether message is deleted for everyone
}

export const sendMessage = async (chatId: string, messageText: string, senderId: string, senderName: string) => {
  try {
    const messagesRef = collection(db, 'chats', chatId, 'messages');
    await addDoc(messagesRef, {
      text: messageText,
      sender: senderId,
      senderName: senderName,
      timestamp: serverTimestamp(),
      createdAt: serverTimestamp(),
      type: 'text',
      status: 'sent',
      readBy: [senderId] // Sender has read their own message
    });
  } catch (error) {
    throw error;
  }
};

export const sendImageMessage = async (chatId: string, imageUrl: string, senderId: string, senderName: string) => {
  try {
    const messagesRef = collection(db, 'chats', chatId, 'messages');
    await addDoc(messagesRef, {
      imageUrl: imageUrl,
      sender: senderId,
      senderName: senderName,
      timestamp: serverTimestamp(),
      createdAt: serverTimestamp(),
      type: 'image',
      status: 'sent',
      readBy: [senderId] // Sender has read their own message
    });
  } catch (error) {
    throw error;
  }
};

export const updateMessageStatus = async (chatId: string, messageId: string, status: 'delivered' | 'seen', userId: string) => {
  try {
    const messageRef = doc(db, 'chats', chatId, 'messages', messageId);
    await updateDoc(messageRef, {
      status: status,
      readBy: arrayUnion(userId)
    });
  } catch (error) {
    console.error('Error updating message status:', error);
  }
};

export const markMessagesAsDelivered = async (chatId: string, messages: FirestoreMessage[], currentUserId: string) => {
  const otherUsersMessages = messages.filter(msg => msg.sender !== currentUserId && msg.status !== 'delivered' && msg.status !== 'seen');
  
  for (const message of otherUsersMessages) {
    await updateMessageStatus(chatId, message.id, 'delivered', currentUserId);
  }
};

export const markMessagesAsSeen = async (chatId: string, messages: FirestoreMessage[], currentUserId: string) => {
  const otherUsersMessages = messages.filter(msg => 
    msg.sender !== currentUserId && 
    msg.status !== 'seen' && 
    (!msg.readBy || !msg.readBy.includes(currentUserId))
  );
  
  for (const message of otherUsersMessages) {
    await updateMessageStatus(chatId, message.id, 'seen', currentUserId);
  }
};

export const subscribeToMessages = (chatId: string, callback: (messages: FirestoreMessage[]) => void) => {
  const messagesRef = collection(db, 'chats', chatId, 'messages');
  const q = query(messagesRef, orderBy('timestamp', 'asc'));
  
  return onSnapshot(q, (snapshot) => {
    const messages: FirestoreMessage[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      messages.push({
        id: doc.id,
        text: data.text,
        imageUrl: data.imageUrl,
        sender: data.sender,
        senderName: data.senderName,
        timestamp: data.timestamp?.toDate() || new Date(),
        createdAt: data.createdAt?.toDate() || new Date(),
        type: data.type,
        status: data.status,
        readBy: data.readBy,
        deletedFor: data.deletedFor,
        deletedForEveryone: data.deletedForEveryone
      });
    });
    callback(messages);
  });
};

// User presence types
export interface UserPresence {
  uid: string;
  displayName: string;
  email: string;
  isOnline: boolean;
  lastSeen: any;
  lastActive: any;
}

// Update user presence
export const updateUserPresence = async (userId: string, displayName: string, email: string) => {
  try {
    const presenceRef = doc(db, 'presence', userId);
    await setDoc(presenceRef, {
      uid: userId,
      displayName,
      email,
      isOnline: true,
      lastSeen: serverTimestamp(),
      lastActive: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating user presence:', error);
  }
};

// Set user offline
export const setUserOffline = async (userId: string) => {
  try {
    const presenceRef = doc(db, 'presence', userId);
    await updateDoc(presenceRef, {
      isOnline: false,
      lastSeen: serverTimestamp()
    });
  } catch (error) {
    console.error('Error setting user offline:', error);
  }
};

// Subscribe to user presence
export const subscribeToUserPresence = (userId: string, callback: (presence: UserPresence | null) => void) => {
  const presenceRef = doc(db, 'presence', userId);
  
  return onSnapshot(presenceRef, (doc) => {
    if (doc.exists()) {
      callback(doc.data() as UserPresence);
    } else {
      callback(null);
    }
  });
};

// Subscribe to all online users
export const subscribeToOnlineUsers = (callback: (users: UserPresence[]) => void) => {
  const presenceRef = collection(db, 'presence');
  const q = query(presenceRef, where('isOnline', '==', true));
  
  return onSnapshot(q, (snapshot) => {
    const users: UserPresence[] = [];
    snapshot.forEach((doc) => {
      users.push(doc.data() as UserPresence);
    });
    callback(users);
  });
};

// Delete message functions
export const deleteMessageForMe = async (chatId: string, messageId: string, userId: string) => {
  try {
    const messageRef = doc(db, 'chats', chatId, 'messages', messageId);
    await updateDoc(messageRef, {
      deletedFor: arrayUnion(userId)
    });
  } catch (error) {
    console.error('Error deleting message for user:', error);
    throw error;
  }
};

export const deleteMessageForEveryone = async (chatId: string, messageId: string, userId: string) => {
  try {
    const messageRef = doc(db, 'chats', chatId, 'messages', messageId);
    const messageDoc = await getDoc(messageRef);
    
    if (!messageDoc.exists()) {
      throw new Error('Message not found');
    }
    
    const messageData = messageDoc.data();
    
    // Only allow sender to delete for everyone
    if (messageData.sender !== userId) {
      throw new Error('Only sender can delete message for everyone');
    }
    
    await updateDoc(messageRef, {
      deletedForEveryone: true,
      deletedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error deleting message for everyone:', error);
    throw error;
  }
};

// Typing indicator functions
export const setTypingIndicator = async (chatId: string, userId: string, userName: string, isTyping: boolean) => {
  try {
    const typingRef = doc(db, 'chats', chatId, 'typing', userId);
    
    if (isTyping) {
      await setDoc(typingRef, {
        userId,
        userName,
        isTyping: true,
        timestamp: serverTimestamp()
      });
    } else {
      // Remove typing indicator after delay
      setTimeout(async () => {
        await updateDoc(typingRef, {
          isTyping: false,
          timestamp: serverTimestamp()
        });
      }, 1000);
    }
  } catch (error) {
    console.error('Error setting typing indicator:', error);
  }
};

export const subscribeToTypingIndicators = (chatId: string, callback: (typingUsers: any[]) => void) => {
  const typingRef = collection(db, 'chats', chatId, 'typing');
  
  return onSnapshot(typingRef, (snapshot) => {
    const typingUsers: any[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      if (data.isTyping) {
        typingUsers.push({
          userId: data.userId,
          userName: data.userName,
          timestamp: data.timestamp
        });
      }
    });
    callback(typingUsers);
  });
};

// Clear chat function
export const clearChat = async (chatId: string) => {
  try {
    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const snapshot = await getDocs(messagesRef);
    
    // Delete all messages in the chat
    const batch = writeBatch(db);
    snapshot.forEach((docSnapshot) => {
      batch.delete(docSnapshot.ref);
    });
    
    await batch.commit();
  } catch (error) {
    console.error('Error clearing chat:', error);
    throw error;
  }
};


export default app;
