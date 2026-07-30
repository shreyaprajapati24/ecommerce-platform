import React, { createContext, useState, useEffect } from 'react';
import api from '../api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await api.get('/users/profile');
          // Sanitize cart data — filter out items with null/deleted products
          if (res.data.cart) {
            res.data.cart = res.data.cart.filter(item => item.product != null);
          }
          setUser(res.data);
        } catch (error) {
          console.error('Failed to fetch profile', error);
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };
    fetchUser();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', res.data.token);
    // Sanitize cart data
    if (res.data.cart) {
      res.data.cart = res.data.cart.filter(item => item.product != null);
    }
    setUser(res.data);
  };

  const register = async (name, email, password, role) => {
    const res = await api.post('/auth/register', { name, email, password, role });
    localStorage.setItem('token', res.data.token);
    setUser(res.data);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const toggleWishlist = async (productId) => {
    try {
      const res = await api.post('/users/wishlist', { productId });
      setUser(prev => ({ ...prev, wishlist: res.data }));
    } catch (error) {
      console.error('Failed to toggle wishlist', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, setUser, toggleWishlist }}>
      {children}
    </AuthContext.Provider>
  );
};
