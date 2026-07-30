import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api';
import { AuthContext } from './AuthContext';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (user && user.cart) {
      // Filter out items with null/deleted products
      setCart(user.cart.filter(item => item.product != null));
    } else {
      setCart([]);
    }
  }, [user]);

  const addToCart = async (productId, quantity = 1) => {
    try {
      const res = await api.post('/users/cart', { productId, quantity });
      setCart(res.data.filter(item => item.product != null));
    } catch (error) {
      console.error('Failed to add to cart', error);
    }
  };

  const updateCartItem = async (productId, quantity) => {
    try {
      const res = await api.put('/users/cart', { productId, quantity });
      setCart(res.data.filter(item => item.product != null));
    } catch (error) {
      console.error('Failed to update cart', error);
    }
  };

  const removeFromCart = async (productId) => {
    try {
      const res = await api.delete(`/users/cart/${productId}`);
      setCart(res.data.filter(item => item.product != null));
    } catch (error) {
      console.error('Failed to remove from cart', error);
    }
  };

  const clearCart = async () => {
    try {
      await api.delete('/users/cart');
      setCart([]);
    } catch (error) {
      console.error('Failed to clear cart', error);
    }
  };

  return (
    <CartContext.Provider value={{ cart, setCart, addToCart, updateCartItem, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};
