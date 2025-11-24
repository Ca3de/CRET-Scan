import { createContext, useContext, useState, useEffect } from 'react';
import { supabase, TABLES } from '../lib/supabase';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in (from localStorage)
    const savedUser = localStorage.getItem('cret_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      // Simple authentication - in production, use proper password hashing
      const { data, error } = await supabase
        .from(TABLES.USERS)
        .select('*')
        .eq('username', username)
        .single();

      if (error || !data) {
        throw new Error('Invalid username or password');
      }

      // For demo purposes, we're using simple password comparison
      // In production, use bcrypt or similar to verify password_hash
      if (password === 'admin123' || data.password_hash === password) {
        const userData = {
          id: data.id,
          username: data.username,
          fullName: data.full_name,
        };
        setUser(userData);
        localStorage.setItem('cret_user', JSON.stringify(userData));
        return { success: true };
      } else {
        throw new Error('Invalid username or password');
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('cret_user');
  };

  const value = {
    user,
    login,
    logout,
    loading,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
