import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const authCheckIdRef = useRef(0);

  // Verificar se usuário está logado ao carregar
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = useCallback(async () => {
    const currentCheckId = ++authCheckIdRef.current;
    const token = localStorage.getItem('bw1_token');
    
    if (!token) {
      if (currentCheckId !== authCheckIdRef.current) return false;
      api.setToken(null);
      setUser(null);
      setIsAuthenticated(false);
      setLoading(false);
      return false;
    }

    try {
      api.setToken(token);
      const response = await api.getCurrentUser();

      if (currentCheckId !== authCheckIdRef.current) return false;
      if (localStorage.getItem('bw1_token') !== token) return false;

      setUser(response.user);
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      if (currentCheckId !== authCheckIdRef.current) return false;
      console.error('Auth check failed:', error);

      if (localStorage.getItem('bw1_token') === token) {
        api.setToken(null);
        localStorage.removeItem('bw1_token');
      }

      setUser(null);
      setIsAuthenticated(false);
      return false;
    } finally {
      if (currentCheckId === authCheckIdRef.current) {
        setLoading(false);
      }
    }
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.login({ email, password });
      api.setToken(response.token);
      setUser(response.user);
      setIsAuthenticated(true);
      setLoading(false);
      return { success: true, user: response.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.register(userData);
      api.setToken(response.token);
      setUser(response.user);
      setIsAuthenticated(true);
      setLoading(false);
      return { success: true, user: response.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    api.setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('bw1_token');
  };

  const updateUser = (userData) => {
    setUser(prev => ({ ...prev, ...userData }));
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    checkAuth,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
