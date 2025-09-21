import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  imageURL: string;
  category: string;
  rating?: number;
  numReviews?: number;
}

export interface CartItem extends Product {
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  const addToCart = useCallback((product: Product) => {
    setItems(currentItems => {
      // Handle both id and _id for product identification
      const productId = product.id || (product as any)._id;
      if (!productId) {
        console.error('Product has no valid ID:', product);
        return currentItems;
      }

      const existingItem = currentItems.find(item => 
        item.id === productId || (item as any)._id === productId
      );
      
      if (existingItem) {
        return currentItems.map(item =>
          (item.id === productId || (item as any)._id === productId)
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      
      // Ensure we're using the correct ID field
      const productToAdd = { ...product };
      if ((product as any)._id && !product.id) {
        productToAdd.id = (product as any)._id;
        delete (productToAdd as any)._id;
      }
      
      return [...currentItems, { ...productToAdd, quantity: 1 }];
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setItems(currentItems => 
      currentItems.filter(item => 
        item.id !== productId && (item as any)._id !== productId
      )
    );
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setItems(currentItems =>
      currentItems.map(item =>
        (item.id === productId || (item as any)._id === productId) 
          ? { ...item, quantity } 
          : item
      )
    );
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const getTotalPrice = useCallback(() => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  }, [items]);

  const getTotalItems = useCallback(() => {
    return items.reduce((total, item) => total + item.quantity, 0);
  }, [items]);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalPrice,
        getTotalItems
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// MongoDB Schema for Orders
/*
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  customerName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  products: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    name: String,
    price: Number,
    quantity: {
      type: Number,
      required: true,
      min: 1
    }
  }],
  totalPrice: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Order', orderSchema);

// API Route: POST /api/checkout
app.post('/api/checkout', async (req, res) => {
  try {
    const { customerName, email, address, products, totalPrice } = req.body;
    
    const order = new Order({
      customerName,
      email,
      address,
      products,
      totalPrice
    });
    
    await order.save();
    res.status(201).json({ message: 'Order placed successfully', orderId: order._id });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
*/