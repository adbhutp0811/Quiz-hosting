import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('qz_token');
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }
      try {
        const res = await api.get('/auth/me');
        setUser(res.data);
      } catch {
        localStorage.removeItem('qz_token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const loggedInUser = res.data.user;
    localStorage.setItem('qz_token', res.data.token);
    setUser(loggedInUser);
    return loggedInUser;
  };

  const register = async (username, email, password, role = 'user') => {
    const res = await api.post('/auth/register', { username, email, password, role });
    const newUser = res.data.user;
    localStorage.setItem('qz_token', res.data.token);
    setUser(newUser);
    return newUser;
  };

  const logout = () => {
    localStorage.removeItem('qz_token');
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const res = await api.get('/auth/me');
      setUser(res.data);
      return res.data;
    } catch {
      localStorage.removeItem('qz_token');
      setUser(null);
      return null;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser, isAdmin: user?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
