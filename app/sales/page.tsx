"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ShoppingCart,
  Search,
  Plus,
  Minus,
  Trash2,
  Package,
  Receipt,
  DollarSign,
  TrendingUp,
  CreditCard,
} from "lucide-react";
import { useProducts, Product } from "../components/ProductContext";
import { useSales } from "../components/SalesContext";
import Toast from "../components/Toast";

export default function SalesPage() {
  const { products, reduceStock } = useProducts();
  const { cart, addToCart, removeFromCart, updateQuantity, clearCart, addSale, getCartTotal, getCartGanancia } = useSales();
  const [searchTerm, setSearchTerm] = useState("");
  const [showCart, setShowCart] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Estado para Toast
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error";
  }>({
    show: false,
    message: "",
    type: "success",
  });

  // Filter available products (with stock)
  const availableProducts = useMemo(() => {
    return products.filter(
      (p) =>
        p.cantidadInicial > 0 &&
        (p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.categoria.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.codigoBarra.includes(searchTerm))
    );
  }, [products, searchTerm]);

  // Get cart items count
  const cartItemCount = cart.reduce((sum, item) => sum + item.cantidad, 0);

  const handleAddToCart = (product: Product) => {
    if (product.cantidadInicial > 0) {
      addToCart({
        productId: product.id,
        nombre: product.nombre,
        categoria: product.categoria,
        precioVenta: product.precioVenta,
        ganancia: product.ganancia,
      });
    }
  };

  const handleProcessSale = async () => {
    if (cart.length === 0) return;

    setIsProcessing(true);

    try {
      // Create sale record
      addSale({
        items: [...cart],
        total: getCartTotal(),
        totalGanancia: getCartGanancia(),
      });

      // Reduce stock for each item
      cart.forEach((item) => {
        reduceStock(item.productId, item.cantidad);
      });

      const totalVenta = getCartTotal();

      // Clear cart
      clearCart();

      // Show toast notification
      setToast({
        show: true,
        message: `Venta completada exitosamente por $${totalVenta.toFixed(2)}`,
        type: "success",
      });
    } catch (error) {
      setToast({
        show: true,
        message: "Error al procesar la venta",
        type: "error",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow-sm border-b border-slate-200 dark:border-slate-700 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              </Link>
              <div className="flex items-center gap-3">
                <div className="bg-blue-500 p-2 rounded-lg">
                  <ShoppingCart className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Nueva Venta
                  </h1>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Selecciona productos para la venta
                  </p>
                </div>
              </div>
            </div>

            {/* Cart Button */}
            <button
              onClick={() => setShowCart(!showCart)}
              className="relative flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors"
            >
              <Receipt className="w-5 h-5" />
              Carrito
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center"
                >
                  {cartItemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Products Section */}
          <div className={`${showCart ? "lg:col-span-2" : "lg:col-span-3"}`}>
            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            {/* Products Grid */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700 overflow-hidden">
              {products.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-20 h-20 mx-auto mb-4 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center">
                    <Package className="w-10 h-10 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    No hay productos en el inventario
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 mb-6">
                    Agrega productos primero para poder vender
                  </p>
                  <Link
                    href="/add-product"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-xl transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                    Agregar Producto
                  </Link>
                </div>
              ) : availableProducts.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-20 h-20 mx-auto mb-4 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center">
                    <Search className="w-10 h-10 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    No se encontraron productos
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400">
                    {searchTerm
                      ? "Intenta con otros términos de búsqueda"
                      : "No hay productos con stock disponible"}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 p-4">
                  {availableProducts.map((product) => {
                    const cartItem = cart.find(
                      (item) => item.productId === product.id
                    );
                    const cantidadEnCarrito = cartItem?.cantidad || 0;
                    const stockDisponible =
                      product.cantidadInicial - cantidadEnCarrito;

                    return (
                      <div
                        key={product.id}
                        className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 border border-slate-200 dark:border-slate-600 hover:border-blue-300 dark:hover:border-blue-500 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg flex items-center justify-center text-white font-bold">
                              {product.nombre.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900 dark:text-white">
                                {product.nombre}
                              </p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                {product.categoria}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p className="text-lg font-bold text-slate-900 dark:text-white">
                              ${product.precioVenta.toFixed(2)}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              Ganancia: ${product.ganancia.toFixed(2)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p
                              className={`text-sm font-medium ${
                                stockDisponible <= product.stockMinimo &&
                                product.stockMinimo > 0
                                  ? "text-red-600 dark:text-red-400"
                                  : "text-slate-600 dark:text-slate-400"
                              }`}
                            >
                              Stock: {stockDisponible}
                            </p>
                          </div>
                        </div>

                        {cartItem ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() =>
                                updateQuantity(product.id, cartItem.cantidad - 1)
                              }
                              className="p-2 bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 rounded-lg transition-colors"
                            >
                              <Minus className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                            </button>
                            <span className="flex-1 text-center font-semibold text-slate-900 dark:text-white">
                              {cartItem.cantidad}
                            </span>
                            <button
                              onClick={() =>
                                updateQuantity(product.id, cartItem.cantidad + 1)
                              }
                              disabled={cartItem.cantidad >= product.cantidadInicial}
                              className="p-2 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-300 dark:disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleAddToCart(product)}
                            className="w-full py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                          >
                            <Plus className="w-4 h-4" />
                            Agregar
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Cart Sidebar */}
          <div
            className={`fixed inset-y-0 right-0 w-full sm:w-96 bg-white dark:bg-slate-800 shadow-2xl border-l border-slate-200 dark:border-slate-700 transform transition-transform duration-300 z-30 lg:relative lg:transform-none lg:shadow-md lg:rounded-2xl lg:border ${
              showCart
                ? "translate-x-0"
                : "translate-x-full lg:translate-x-0 lg:hidden"
            }`}
          >
            <div className="h-full flex flex-col lg:rounded-2xl lg:overflow-hidden">
              {/* Cart Header */}
              <div className="px-6 py-4 bg-gradient-to-r from-blue-500 to-cyan-600 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Receipt className="w-5 h-5 text-white" />
                    <h2 className="text-lg font-semibold text-white">
                      Carrito de Venta
                    </h2>
                  </div>
                  <button
                    onClick={() => setShowCart(false)}
                    className="lg:hidden p-1 text-white/80 hover:text-white"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto p-4">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6">
                    <ShoppingCart className="w-16 h-16 text-slate-300 dark:text-slate-600 mb-4" />
                    <p className="text-slate-500 dark:text-slate-400">
                      El carrito está vacío
                    </p>
                    <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
                      Agrega productos para comenzar la venta
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {cart.map((item) => (
                      <div
                        key={item.productId}
                        className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-medium text-slate-900 dark:text-white">
                              {item.nombre}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {item.categoria}
                            </p>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.productId)}
                            className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() =>
                                updateQuantity(item.productId, item.cantidad - 1)
                              }
                              className="p-1 bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 rounded transition-colors"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-8 text-center text-sm font-semibold text-slate-900 dark:text-white">
                              {item.cantidad}
                            </span>
                            <button
                              onClick={() =>
                                updateQuantity(item.productId, item.cantidad + 1)
                              }
                              className="p-1 bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <div className="text-right">
                            <p className="font-semibold text-slate-900 dark:text-white">
                              ${(item.precioVenta * item.cantidad).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Cart Footer */}
              <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/30">
                {cart.length > 0 && (
                  <>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600 dark:text-slate-400">
                          <TrendingUp className="w-4 h-4 inline mr-1" />
                          Ganancia:
                        </span>
                        <span className="font-medium text-emerald-600 dark:text-emerald-400">
                          +${getCartGanancia().toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-semibold text-slate-900 dark:text-white">
                          Total:
                        </span>
                        <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          ${getCartTotal().toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <button
                        onClick={handleProcessSale}
                        disabled={isProcessing || cart.length === 0}
                        className="w-full py-3 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
                      >
                        <CreditCard className="w-5 h-5" />
                        {isProcessing ? "Procesando..." : "Completar Venta"}
                      </button>
                      <button
                        onClick={clearCart}
                        className="w-full py-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium transition-colors"
                      >
                        Vaciar Carrito
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Cart Overlay */}
          {showCart && (
            <div
              className="fixed inset-0 bg-black/50 z-20 lg:hidden"
              onClick={() => setShowCart(false)}
            />
          )}
        </div>
      </main>
    </div>
  );
}
