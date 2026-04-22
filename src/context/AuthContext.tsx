import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import type { User as FirebaseUser } from 'firebase/auth';
import { 
  onAuthStateChange, 
  loginUser, 
  logoutUser,
  updateUserPresence,
  setUserOffline
} from '../firebase';
import { ensureUserDocument } from '../firebase';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, remember?: boolean) => Promise<boolean>;
  logout: () => Promise<void>;
  isLoading: boolean;
  firebaseUser: FirebaseUser | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const firebaseUserRef = useRef<FirebaseUser | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (nextFirebaseUser) => {
      const prevFirebaseUser = firebaseUserRef.current;
      setFirebaseUser(nextFirebaseUser);
      firebaseUserRef.current = nextFirebaseUser;
      
      if (nextFirebaseUser) {
          try {
            await ensureUserDocument(nextFirebaseUser);
            
            // Update user presence to online
            await updateUserPresence(
              nextFirebaseUser.uid,
              nextFirebaseUser.email?.split('@')[0] || 'User',
              nextFirebaseUser.email || ''
            );
            
            setUser({
              id: nextFirebaseUser.uid,
              email: nextFirebaseUser.email || '',
              name: nextFirebaseUser.email?.split('@')[0] || 'User'
            });
          } catch (error) {
            console.error('Error ensuring user document:', error);
          }
      } else {
        setUser(null);
        if (prevFirebaseUser) {
          setUserOffline(prevFirebaseUser.uid);
        }
      }
      
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Handle page visibility for presence tracking
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (firebaseUser) {
        if (document.hidden) {
          // User is not actively viewing the page
          setUserOffline(firebaseUser.uid);
        } else {
          // User is actively viewing the page
          updateUserPresence(
            firebaseUser.uid,
            firebaseUser.email?.split('@')[0] || 'User',
            firebaseUser.email || ''
          );
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [firebaseUser]);

  const login = async (email: string, password: string, remember: boolean = false): Promise<boolean> => {
    try {
      const firebaseUser = await loginUser(email, password);
      
      if (remember) {
        localStorage.setItem('rememberMe', 'true');
      }
      
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await logoutUser();
      localStorage.removeItem('rememberMe');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, firebaseUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
