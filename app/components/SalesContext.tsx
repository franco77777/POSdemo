"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

export interface CartItem {
  productId: string;
  nombre: string;
  categoria: string;
  precioVenta: number;
  cantidad: number;
  ganancia: number;
}

export interface Sale {
  id: string;
  fecha: string;
  items: CartItem[];
  total: number;
  totalGanancia: number;
}

interface SalesContextType {
  cart: CartItem[];
  sales: Sale[];
  addToCart: (item: Omit<CartItem, "cantidad">) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, cantidad: number) => void;
  clearCart: () => void;
  addSale: (sale: Omit<Sale, "id" | "fecha">) => void;
  getCartTotal: () => number;
  getCartGanancia: () => number;
}

const SalesContext = createContext<SalesContextType | undefined>(undefined);

export function SalesProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);

  const addToCart = useCallback((item: Omit<CartItem, "cantidad">) => {
    setCart((prev) => {
      const existingItem = prev.find((i) => i.productId === item.productId);
      if (existingItem) {
        return prev.map((i) =>
          i.productId === item.productId
            ? { ...i, cantidad: i.cantidad + 1 }
            : i
        );
      }
      return [...prev, { ...item, cantidad: 1 }];
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, cantidad: number) => {
    if (cantidad <= 0) {
      setCart((prev) => prev.filter((item) => item.productId !== productId));
    } else {
      setCart((prev) =>
        prev.map((item) =>
          item.productId === productId ? { ...item, cantidad } : item
        )
      );
    }
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const addSale = useCallback((sale: Omit<Sale, "id" | "fecha">) => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const newSale: Sale = {
      ...sale,
      id: `SALE-${timestamp}`,
      fecha: new Date().toISOString(),
    };
    setSales((prev) => [...prev, newSale]);
  }, []);

  const getCartTotal = useCallback(() => {
    return cart.reduce((total, item) => total + item.precioVenta * item.cantidad, 0);
  }, [cart]);

  const getCartGanancia = useCallback(() => {
    return cart.reduce((total, item) => total + item.ganancia * item.cantidad, 0);
  }, [cart]);

  return (
    <SalesContext.Provider
      value={{
        cart,
        sales,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        addSale,
        getCartTotal,
        getCartGanancia,
      }}
    >
      {children}
    </SalesContext.Provider>
  );
}

export function useSales() {
  const context = useContext(SalesContext);
  if (context === undefined) {
    throw new Error("useSales must be used within a SalesProvider");
  }
  return context;
}
