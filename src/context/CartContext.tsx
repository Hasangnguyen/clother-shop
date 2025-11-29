import React, { createContext, useState, useContext, ReactNode } from 'react';
import { Product } from '../features/Products/models/Product';

interface CartItem {
    product: Product;
    quantity: number;
}

interface CartContextProps {
    cartItems: CartItem[];
    addToCart: (item: Product) => void;
    removeFromCart: (id: number) => void;
    updateQuantity: (id: number, quantity: number) => void;
    clearCart: () => void;
    getTotal: () => number;
}

const CartContext = createContext<CartContextProps | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);

    const addToCart = (item: Product) => {
        setCartItems(prev => {
            const existing = prev.find(ci => ci.product.id === item.id);
            if (existing) {
                return prev.map(ci =>
                    ci.product.id === item.id ? { ...ci, quantity: ci.quantity + 1 } : ci
                );
            } else {
                return [...prev, { product: item, quantity: 1 }];
            }
        });
    };

    const removeFromCart = (id: number) =>
        setCartItems(cartItems.filter((ci) => ci.product.id !== id));

    const updateQuantity = (id: number, quantity: number) => {
        if (quantity <= 0) {
            removeFromCart(id);
        } else {
            setCartItems(prev =>
                prev.map(ci =>
                    ci.product.id === id ? { ...ci, quantity } : ci
                )
            );
        }
    };

    const clearCart = () => setCartItems([]);

    const getTotal = () => cartItems.reduce((sum, ci) => sum + ci.product.price * ci.quantity, 0);

    return (
        <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart, getTotal }}>
            {children}
        </CartContext.Provider>
    )
};

export const useCart = () => {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error('useCart must be used within CartProvider');
    return ctx;
};
