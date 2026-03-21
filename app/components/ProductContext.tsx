"use client";

import React, { createContext, useContext, useState, useCallback, useRef } from "react";
import { ActivityType } from "./ActivityContext";

export interface Product {
  id: string;
  nombre: string;
  categoria: string;
  precioInicial: number;
  precioVenta: number;
  codigoBarra: string;
  cantidadInicial: number;
  stockMinimo: number;
  stockMaximo: number;
  ganancia: number;
  ventasTotales: number;
  gananciasTotales: number;
  fechaCreacion: string;
}

interface ProductContextType {
  products: Product[];
  categories: string[];
  addProduct: (product: Omit<Product, "id" | "fechaCreacion">) => Product;
  addCategory: (category: string) => void;
  deleteProduct: (id: string) => { success: boolean; product?: Product };
  updateProduct: (id: string, product: Partial<Product>) => { success: boolean; product?: Product };
  reduceStock: (id: string, cantidad: number) => void;
  isBarcodeUnique: (barcode: string, excludeId?: string) => boolean;
  setActivityCallback: (callback: (type: ActivityType, details: string, productId: string, productName: string, quantity?: number, amount?: number) => void) => void;
}

const defaultCategories = ["Otros"];

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export function ProductProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>(defaultCategories);
  const activityCallbackRef = useRef<((type: ActivityType, details: string, productId: string, productName: string, quantity?: number, amount?: number) => void) | null>(null);

  const setActivityCallback = useCallback((callback: (type: ActivityType, details: string, productId: string, productName: string, quantity?: number, amount?: number) => void) => {
    activityCallbackRef.current = callback;
  }, []);

  const addProduct = useCallback(
    (productData: Omit<Product, "id" | "fechaCreacion">) => {
      const timestamp = Date.now().toString(36).toUpperCase();
      const random = Math.random().toString(36).substring(2, 5).toUpperCase();

      const newProduct: Product = {
        ...productData,
        id: `PROD-${timestamp}${random}`,
        fechaCreacion: new Date().toISOString(),
      };

      setProducts((prev) => [...prev, newProduct]);

      // Registrar actividad
      if (activityCallbackRef.current) {
        activityCallbackRef.current(
          "created",
          `Producto creado con stock inicial de ${newProduct.cantidadInicial} unidades`,
          newProduct.id,
          newProduct.nombre,
          newProduct.cantidadInicial,
          newProduct.precioInicial * newProduct.cantidadInicial
        );
      }

      return newProduct;
    },
    [],
  );

  const addCategory = useCallback((category: string) => {
    const trimmedCategory = category.trim();
    if (trimmedCategory) {
      setCategories((prev) => {
        if (prev.includes(trimmedCategory)) return prev;
        return [...prev, trimmedCategory];
      });
    }
  }, []);

  const deleteProduct = useCallback((id: string) => {
    const product = products.find((p) => p.id === id);
    if (product) {
      setProducts((prev) => prev.filter((p) => p.id !== id));

      // Registrar actividad
      if (activityCallbackRef.current) {
        activityCallbackRef.current(
          "deleted",
          `Producto eliminado del inventario`,
          product.id,
          product.nombre
        );
      }

      return { success: true, product };
    }
    return { success: false };
  }, [products]);

  const updateProduct = useCallback((id: string, updates: Partial<Product>) => {
    const product = products.find((p) => p.id === id);
    if (product) {
      const updatedProduct = { ...product, ...updates };
      setProducts((prev) =
        prev.map((p) => (p.id === id ? updatedProduct : p)),
      );

      // Registrar actividad
      if (activityCallbackRef.current) {
        const changes: string[] = [];
        if (updates.nombre !== undefined && updates.nombre !== product.nombre) {
          changes.push(`nombre de "${product.nombre}" a "${updates.nombre}"`);
        }
        if (updates.cantidadInicial !== undefined && updates.cantidadInicial !== product.cantidadInicial) {
          changes.push(`stock de ${product.cantidadInicial} a ${updates.cantidadInicial}`);
        }
        if (updates.precioVenta !== undefined && updates.precioVenta !== product.precioVenta) {
          changes.push(`precio de $${product.precioVenta} a $${updates.precioVenta}`);
        }

        const details = changes.length > 0
          ? `Modificado: ${changes.join(", ")}`
          : "Producto actualizado";

        activityCallbackRef.current(
          "updated",
          details,
          product.id,
          updatedProduct.nombre
        );
      }

      return { success: true, product: updatedProduct };
    }
    return { success: false };
  }, [products]);

  const reduceStock = useCallback((id: string, cantidad: number) => {
    setProducts((prev) =
      prev.map((p) =
003e
        p.id === id
          ? {
              ...p,
              cantidadInicial: Math.max(0, p.cantidadInicial - cantidad),
              ventasTotales: p.ventasTotales + cantidad,
              gananciasTotales: p.gananciasTotales + p.ganancia * cantidad,
            }
          : p,
      ),
    );
  }, []);

  const isBarcodeUnique = useCallback(
    (barcode: string, excludeId?: string) => {
      if (!barcode.trim()) return true;
      return !products.some(
        (p) => p.codigoBarra === barcode.trim() && p.id !== excludeId,
      );
    },
    [products],
  );

  return (
    <ProductContext.Provider
      value={{
        products,
        categories,
        addProduct,
        addCategory,
        deleteProduct,
        updateProduct,
        reduceStock,
        isBarcodeUnique,
        setActivityCallback,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error("useProducts must be used within a ProductProvider");
  }
  return context;
}
