import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

// Cart reducer
const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_ITEM':
      // Check if item already exists
      const existingItem = state.items.find(item => item.id === action.payload.id);
      if (existingItem) {
        return state; // Don't add duplicate items for digital products
      }
      
      return {
        ...state,
        items: [...state.items, { ...action.payload, quantity: 1 }],
        total: state.total + action.payload.price
      };
      
    case 'REMOVE_ITEM':
      const itemToRemove = state.items.find(item => item.id === action.payload);
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload),
        total: state.total - (itemToRemove ? itemToRemove.price : 0)
      };
      
    case 'CLEAR_CART':
      return {
        items: [],
        total: 0
      };
      
    case 'LOAD_CART':
      return action.payload;
      
    default:
      return state;
  }
};

const initialState = {
  items: [],
  total: 0
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const { user } = useAuth();

  // Load cart from localStorage when user changes
  useEffect(() => {
    if (user) {
      // Load user-specific cart
      const savedCart = localStorage.getItem(`cart_${user.uid}`);
      if (savedCart) {
        try {
          const parsedCart = JSON.parse(savedCart);
          dispatch({ type: 'LOAD_CART', payload: parsedCart });
        } catch (error) {
          console.error('Error loading cart from localStorage:', error);
        }
      }
    } else {
      // Load guest cart
      const savedCart = localStorage.getItem('cart_guest');
      if (savedCart) {
        try {
          const parsedCart = JSON.parse(savedCart);
          dispatch({ type: 'LOAD_CART', payload: parsedCart });
        } catch (error) {
          console.error('Error loading guest cart from localStorage:', error);
        }
      }
    }
  }, [user]);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    const cartKey = user ? `cart_${user.uid}` : 'cart_guest';
    localStorage.setItem(cartKey, JSON.stringify(state));
  }, [state, user]);

  const addItem = (item) => {
    dispatch({ type: 'ADD_ITEM', payload: item, userId: user?.uid });
  };

  const removeItem = (itemId) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { id: itemId }, userId: user?.uid });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART', userId: user?.uid });
  };

  const isInCart = (itemId) => {
    return state.items.some(item => item.id === itemId);
  };

  const getItemCount = () => {
    return state.items.length;
  };

  const getTotalPrice = () => {
    return state.total;
  };

  const value = {
    items: state.items,
    total: state.total,
    addItem,
    removeItem,
    clearCart,
    isInCart,
    getItemCount,
    getTotalPrice
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
