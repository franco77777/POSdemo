"use client";

import React, { useEffect } from "react";
import { useProducts } from "./ProductContext";
import { useSales } from "./SalesContext";
import { useActivity, ActivityType } from "./ActivityContext";

// Componente puente que conecta los contextos de productos y ventas con el historial de actividades
export function ActivityBridge() {
  const { setActivityCallback } = useProducts();
  const { addActivity } = useActivity();
  const { sales } = useSales();

  useEffect(() => {
    // Configurar el callback para registrar actividades de productos
    setActivityCallback((type: ActivityType, details: string, productId: string, productName: string, quantity?: number, amount?: number) => {
      addActivity({
        type,
        productId,
        productName,
        user: "Supervisor",
        details,
        quantity,
        amount,
      });
    });
  }, [setActivityCallback, addActivity]);

  // Efecto para detectar nuevas ventas y registrarlas como actividades
  const previousSalesLength = React.useRef(sales.length);

  useEffect(() => {
    if (sales.length > previousSalesLength.current) {
      // Nueva venta agregada
      const newSale = sales[sales.length - 1];
      if (newSale) {
        newSale.items.forEach((item) => {
          addActivity({
            type: "sold",
            productId: item.productId,
            productName: item.nombre,
            user: "Supervisor",
            details: `Venta de ${item.cantidad} unidades`,
            quantity: item.cantidad,
            amount: item.precioVenta * item.cantidad,
          });
        });
      }
    }
    previousSalesLength.current = sales.length;
  }, [sales, addActivity]);

  return null;
}
