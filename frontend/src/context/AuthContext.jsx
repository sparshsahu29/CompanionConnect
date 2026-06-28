import React, { createContext, useState, useEffect, useContext } from 'react';
import { getProfile, login as authLogin, logout as authLogout, signup as authSignup } from '../api/authApi';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount: if a token exists, verify it by fetching the profile
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setLoading(false);
      return;
    }
    getProfile()
      .then((user) => setCurrentUser(user))
      .catch(() => {
        localStorage.removeItem('access_token');
        setCurrentUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const signup = async (fullName, email, password) => {
    const user = await authSignup(fullName, email, password);
    setCurrentUser(user);
    return user;
  };

  const login = async (email, password) => {
    const user = await authLogin(email, password);
    setCurrentUser(user);
    return user;
  };

  const logout = async () => {
    await authLogout();
    setCurrentUser(null);
  };

  const fetchProfile = async () => {
    try {
      const user = await getProfile();
      setCurrentUser(user);
    } catch {
      setCurrentUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, signup, fetchProfile, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
