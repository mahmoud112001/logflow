import { createContext, useState, useEffect } from 'react';
import * as authService from '../services/auth.service';

export const AuthContext = createContext(undefined);

const STORAGE_KEY = 'logflow_developer';

export const AuthProvider = ({ children }) => {
  const [developer, setDeveloper] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session from localStorage on first mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setDeveloper(JSON.parse(stored));
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setLoading(false);
  }, []);

  // Persist developer to localStorage helper
  const persist = (dev) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dev));
    setDeveloper(dev);
  };

  const login = async (email, password) => {
    const dev = await authService.login(email, password);
    persist(dev);
    return dev;
  };

  const register = async (username, email, password) => {
    const dev = await authService.register(username, email, password);
    persist(dev);
    return dev;
  };

  // Caller is responsible for navigating away after logout
  const logout = async () => {
    await authService.logout();
    setDeveloper(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <AuthContext.Provider value={{ developer, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
