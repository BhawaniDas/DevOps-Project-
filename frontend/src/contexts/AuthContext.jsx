import React, { createContext, useContext, useState, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,  setUser]  = useState(() => { try { return JSON.parse(localStorage.getItem('td_user')); } catch { return null; } });
  const [token, setToken] = useState(() => localStorage.getItem('td_token'));

  const persist = (tkn, usr) => {
    setToken(tkn); setUser(usr);
    if (tkn) { localStorage.setItem('td_token', tkn); localStorage.setItem('td_user', JSON.stringify(usr)); }
    else      { localStorage.removeItem('td_token');   localStorage.removeItem('td_user'); }
  };

  const login = useCallback(async (email, password) => {
    const data = await api.post('/auth/login', { email, password });
    persist(data.token, data.user);
    return data.user;
  }, []);

  const register = useCallback(async (payload) => {
    const data = await api.post('/auth/register', payload);
    persist(data.token, data.user);
    return data.user;
  }, []);

  const logout = useCallback(() => persist(null, null), []);

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isAdmin: user?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
