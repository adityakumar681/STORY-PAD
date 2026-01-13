import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import api, { setLogoutCallback } from '../utils/api';

const AuthContext = createContext();

// Simple token validation - check if token exists and decode basic payload
const isTokenValid = (token) => {
  if (!token || typeof token !== 'string') return false;
  
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    
    // Decode payload to check expiration
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    const now = Math.floor(Date.now() / 1000);
    
    // Check if token has expired
    if (payload.exp && payload.exp < now) {
      return false;
    }
    
    return true;
  } catch (error) {
    console.warn('Invalid token format:', error);
    return false;
  }
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    console.log('Logging out user');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    delete api.defaults.headers.common['Authorization'];
  }, []);

  const login = useCallback((userData, token) => {
    console.log('Logging in user:', userData.username);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }, []);

  // Initialize auth state from localStorage
  useEffect(() => {
    console.log('Initializing auth state...');
    setLogoutCallback(logout);

    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (token && userData) {
      try {
        if (isTokenValid(token)) {
          const parsedUser = JSON.parse(userData);
          console.log('Valid token found, logging in user:', parsedUser.username);
          setUser(parsedUser);
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
          console.log('Invalid or expired token found, clearing storage');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    } else {
      console.log('No stored auth data found');
    }

    setLoading(false);
  }, [logout]);

  const checkTokenValidity = useCallback(() => {
    const token = localStorage.getItem('token');
    return isTokenValid(token);
  }, []);

  const value = { user, login, logout, checkTokenValidity, loading };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};