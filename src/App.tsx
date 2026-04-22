import React, { useState, useEffect } from 'react';
import { registerServiceWorker, requestNotificationPermission } from './utils/serviceWorkerRegistration';
import { performanceMonitor } from './utils/performanceMonitor';
import ChatHeader from './components/ChatHeader';
import MessageArea from './components/MessageArea';
import MessageInput from './components/MessageInput';
import LoginPage from './components/LoginPage';
import MessageCountBadge from './components/MessageCountBadge';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Contact } from './types';
import { fetchAllUsers, generateChatId } from './firebase';
import './index.css';

const ChatApp: React.FC = () => {
  const { user, logout } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [contact, setContact] = useState<Contact | null>(null);
  const [chatId, setChatId] = useState<string>('');

  useEffect(() => {
    if (!user) return;

    const findPartner = async () => {
      try {
        console.log('Current user:', user);
        console.log('Current user ID:', user.id);
        const allUsers = await fetchAllUsers();
        console.log('All users found:', allUsers);
        console.log('Number of users:', allUsers.length);
        
        // Debug: Show each user's UID
        allUsers.forEach((u, index) => {
          console.log(`User ${index}:`, u.uid, u.email);
        });
        
        // If no users exist yet, create a demo partner
        if (allUsers.length === 0) {
          console.log('No users found, creating demo partner...');
          // Create a simple demo partner for testing
          const demoPartner = {
            uid: 'demo-partner',
            email: 'partner@demo.com',
            displayName: 'Demo Partner'
          };
          
          const newChatId = generateChatId(user.id, demoPartner.uid);
          setChatId(newChatId);
          
          setContact({
            id: demoPartner.uid,
            name: demoPartner.displayName,
            avatar: `https://picsum.photos/seed/${demoPartner.uid}/200/200.jpg`,
            isOnline: true,
            lastSeen: 'Active now'
          });
          return;
        }
        
        // Debug: Check if user.id matches any user.uid
        const matchingUser = allUsers.find(u => u.uid === user.id);
        console.log('User matching current ID:', matchingUser);
        
        const partner = allUsers.find(u => u.uid !== user.id);
        console.log('Found partner:', partner);
        
        if (partner) {
          const newChatId = generateChatId(user.id, partner.uid);
          setChatId(newChatId);
          
          setContact({
            id: partner.uid,
            name: partner.displayName || partner.email?.split('@')[0] || 'Partner',
            avatar: `https://picsum.photos/seed/${partner.uid}/200/200.jpg`,
            isOnline: true,
            lastSeen: 'Active now'
          });
        } else {
          console.log('No partner found - you might be the only user');
          // Create a demo partner for testing
          const demoPartner = {
            uid: 'demo-partner',
            email: 'partner@demo.com',
            displayName: 'Demo Partner'
          };
          
          const newChatId = generateChatId(user.id, demoPartner.uid);
          setChatId(newChatId);
          
          setContact({
            id: demoPartner.uid,
            name: demoPartner.displayName,
            avatar: `https://picsum.photos/seed/${demoPartner.uid}/200/200.jpg`,
            isOnline: true,
            lastSeen: 'Active now'
          });
        }
      } catch (error) {
        console.error('Error finding partner:', error);
        // Fallback to demo partner
        const demoPartner = {
          uid: 'demo-partner',
          email: 'partner@demo.com',
          displayName: 'Demo Partner'
        };
        
        const newChatId = generateChatId(user.id, demoPartner.uid);
        setChatId(newChatId);
        
        setContact({
          id: demoPartner.uid,
          name: demoPartner.displayName,
          avatar: `https://picsum.photos/seed/${demoPartner.uid}/200/200.jpg`,
          isOnline: true,
          lastSeen: 'Active now'
        });
      }
    };

    findPartner();
  }, [user]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Initialize service worker for offline support and performance
  useEffect(() => {
    registerServiceWorker();
    requestNotificationPermission();
    
    // Start performance monitoring
    performanceMonitor.startMeasure();
    
    // Log performance report every 30 seconds
    const performanceInterval = setInterval(() => {
      performanceMonitor.logPerformanceReport();
    }, 30000);
    
    // Cleanup on unmount
    return () => {
      clearInterval(performanceInterval);
      performanceMonitor.cleanup();
    };
  }, []);

  const handleLogout = async () => {
    await logout();
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  if (!contact || !chatId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Finding chat partner...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col ${isDarkMode ? 'dark bg-whatsapp-dark-bg' : 'bg-gray-100'}`}>
      <MessageCountBadge isDarkMode={isDarkMode} />
      
      <ChatHeader 
        contact={contact} 
        isDarkMode={isDarkMode} 
        onToggleDarkMode={toggleDarkMode}
        onLogout={handleLogout}
        currentUser={user ? { name: user.name, email: user.email } : undefined}
        chatId={chatId}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <MessageArea 
          isDarkMode={isDarkMode}
          chatId={chatId}
        />
        
        <MessageInput 
          isDarkMode={isDarkMode}
          chatId={chatId}
        />
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return user ? <ChatApp /> : <LoginPage />;
};

export default App;
