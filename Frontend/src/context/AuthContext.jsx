import React, { createContext, useState, useEffect, useContext } from 'react';
import { getProfile, login as authLogin, logout as authLogout } from '../api/authApi';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const user = await getProfile();
      setCurrentUser(user);
    } catch (error) {
      setCurrentUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const login = async (email, password) => {
    const user = await authLogin(email, password);
    setCurrentUser(user);
    return user;
  };

  const logout = async () => {
    await authLogout();
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, fetchProfile, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
