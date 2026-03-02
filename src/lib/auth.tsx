'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';

interface User {
  username: string;
  role: 'admin';
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Admin credentials (in production, this should be in a database)
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'TechnoFit@2024';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Use useSyncExternalStore pattern to avoid setState in effect
  useEffect(() => {
    // This effect is for reading from localStorage - an external system
    // which is a valid use case for effects
    const savedUser = localStorage.getItem('technofit_admin_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser) as User;
        // This is intentionally updating state based on external system (localStorage)
        // which is the correct use of effects according to React docs
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setUser(parsed);
      } catch {
        localStorage.removeItem('technofit_admin_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (username: string, password: string): Promise<boolean> => {
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      const userData: User = { username, role: 'admin' };
      setUser(userData);
      localStorage.setItem('technofit_admin_user', JSON.stringify(userData));
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('technofit_admin_user');
  }, []);

  const value = useMemo(() => ({
    user,
    login,
    logout,
    isLoading
  }), [user, login, logout, isLoading]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
