import { useState, createContext, useContext, useEffect } from 'react';
import api from '../services/api';
import { syncPermissionsFromServer } from '../utils/permissions';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(() => {
    const token = localStorage.getItem('token');
    const stored = localStorage.getItem('user');
    return !!token && !stored;
  });

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await api.get('/auth/me');
          const userData = res.data || res.user || res;
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
          syncPermissionsFromServer().catch(() => {});
        } catch (error) {
          if (error?.message === 'Unauthorized' || error?.status === 401 || error?.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
          }
        }
      } else {
        localStorage.removeItem('user');
        setUser(null);
      }
      setLoading(false);
    };
    fetchUser();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const token = res.data?.token || res.token;
    const userData = res.data?.user || res.user;
    
    if (token) {
      localStorage.setItem('token', token);
    }
    if (userData) {
      localStorage.setItem('user', JSON.stringify(userData));
    }
    setUser(userData);
    syncPermissionsFromServer().catch(() => {});
    return { token, user: userData };
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const updateUser = (updatedData) => {
    setUser(prev => {
      const updated = { ...prev, ...updatedData };
      localStorage.setItem('user', JSON.stringify(updated));
      return updated;
    });
  };

  const hasRole = (role) => user?.role === role;

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, loading, isAuthenticated: !!user, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
