"use client";

import Link from "next/link";
import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  Settings,
  Receipt,
  PlusCircle,
  Search,
  History,
  X,
  Barcode,
  ChevronRight,
  TrendingUp,
  DollarSign,
} from "lucide-react";
import { useProducts } from "./components/ProductContext";
import { useSales } from "./components/SalesContext";

const menuItems = [
  {
    title: "Agregar Producto",
    description: "Registrar nuevo producto en el inventario",
    icon: PlusCircle,
    href: "/add-product",
    color: "bg-emerald-500",
    hoverColor: "hover:bg-emerald-600",
  },
  {
    title: "Nueva Venta",
    description: "Crear una venta rápida",
    icon: ShoppingCart,
    href: "/sales",
    color: "bg-blue-500",
    hoverColor: "hover:bg-blue-600",
  },
  {
    title: "Buscar Producto",
    description: "Buscar productos por nombre o código",
    icon: Search,
    href: "#",
    color: "bg-violet-500",
    hoverColor: "hover:bg-violet-600",
    isAction: true,
    action: "openSearch",
  },
  {
    title: "Inventario",
    description: "Ver y gestionar el inventario",
    icon: Package,
    href: "/inventory",
    color: "bg-amber-500",
    hoverColor: "hover:bg-amber-600",
  },
  {
    title: "Clientes",
    description: "Gestión de clientes",
    icon: Users,
    href: "#",
    color: "bg-cyan-500",
    hoverColor: "hover:bg-cyan-600",
  },
  {
    title: "Historial",
    description: "Ver historial de actividades",
    icon: History,
    href: "/history",
    color: "bg-rose-500",
    hoverColor: "hover:bg-rose-600",
  },
  {
    title: "Reportes",
    description: "Generar reportes de ventas",
    icon: BarChart3,
    href: "/reports",
    color: "bg-indigo-500",
    hoverColor: "hover:bg-indigo-600",
  },
  {
    title: "Facturación",
    description: "Gestionar facturas",
    icon: Receipt,
    href: "#",
    color: "bg-orange-500",
    hoverColor: "hover:bg-orange-600",
  },
  {
    title: "Configuración",
    description: "Ajustes del sistema",
    icon: Settings,
    href: "#",
    color: "bg-slate-500",
    hoverColor: "hover:bg-slate-600",
  },
];

// Componente del Modal de Búsqueda
function SearchProductModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { products } = useProducts();
  const { sales } = useSales();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase().trim();
    return products.filter(
      (product) =>
        product.nombre.toLowerCase().includes(query) ||
        product.codigoBarra.toLowerCase().includes(query),
    );
  }, [searchQuery, products]);

  // Calculate stats for a product
  const getProductStats = (productId: string) => {
    const productSales = sales.filter((sale) =>
      sale.items.some((item) => item.productId === productId),
    );

    let totalUnits = 0;
    let totalProfit = 0;

    productSales.forEach((sale) => {
      const items = sale.items.filter((item) => item.productId === productId);
      items.forEach((item) => {
        totalUnits += item.cantidad;
        totalProfit += item.ganancia * item.cantidad;
      });
    });

    return { totalUnits, totalProfit };
  };

  const handleProductClick = (productId: string) => {
    onClose();
    setSearchQuery("");
    router.push(`/product-profile/${productId}`);
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "USD",
    }).format(value);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-violet-100 dark:bg-violet-900/30 rounded-lg">
              <Search className="w-5 h-5 text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Buscar Producto
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Busca por nombre o código de barras
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Escribe el nombre del producto o escanea el código de barras..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              autoFocus
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>
            )}
          </div>
        </div>

        {/* Results */}
        <div className="max-h-[400px] overflow-y-auto">
          {!searchQuery.trim() ? (
            <div className="p-8 text-center text-slate-500 dark:text-slate-400">
              <Barcode className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Comienza a escribir para buscar productos</p>
              <p className="text-sm mt-1">
                Puedes buscar por nombre o código de barras
              </p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="p-8 text-center text-slate-500 dark:text-slate-400">
              <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No se encontraron productos</p>
              <p className="text-sm mt-1">
                Intenta con otro término de búsqueda
              </p>
            </div>
          ) : (
            <div className="p-2">
              {filteredProducts.map((product) => {
                const stats = getProductStats(product.id);
                const isLowStock =
                  product.cantidadInicial <= product.stockMinimo &&
                  product.stockMinimo > 0;

                return (
                  <button
                    key={product.id}
                    onClick={() => handleProductClick(product.id)}
                    className="w-full text-left p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-xl transition-all group"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-slate-900 dark:text-white truncate">
                            {product.nombre}
                          </h3>
                          {isLowStock && (
                            <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-medium rounded-full">
                              Stock bajo
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                          <span className="flex items-center gap-1">
                            <Barcode className="w-3 h-3" />
                            {product.codigoBarra || "Sin código"}
                          </span>
                          <span>{product.categoria}</span>
                          <span
                            className={`${
                              isLowStock
                                ? "text-amber-600 dark:text-amber-400"
                                : "text-emerald-600 dark:text-emerald-400"
                            }`}
                          >
                            {product.cantidadInicial} en stock
                          </span>
                        </div>
                        {/* Sales preview */}
                        {stats.totalUnits > 0 && (
                          <div className="flex items-center gap-4 mt-2 text-xs text-slate-500 dark:text-slate-400">
                            <span className="flex items-center gap-1">
                              <TrendingUp className="w-3 h-3 text-emerald-500" />
                              {stats.totalUnits} vendidos
                            </span>
                            <span className="flex items-center gap-1">
                              <DollarSign className="w-3 h-3 text-violet-500" />
                              {formatCurrency(stats.totalProfit)} ganancia
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-slate-900 dark:text-white">
                          {formatCurrency(product.precioVenta)}
                        </p>
                        <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-violet-500 transition-colors ml-auto" />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-700/50 border-t border-slate-200 dark:border-slate-700">
          <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
            Presiona ESC para cerrar o haz clic fuera del modal
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const { products } = useProducts();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const router = useRouter();

  // Handler for menu item clicks
  const handleMenuClick = (
    item: (typeof menuItems)[0],
    e: React.MouseEvent,
  ) => {
    if (item.isAction && item.action === "openSearch") {
      e.preventDefault();
      setIsSearchOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow-sm border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                Sistema POS
              </h1>
              <p className="mt-1 text-slate-500 dark:text-slate-400">
                Panel de control principal
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-500 dark:text-slate-400">
                {new Date().toLocaleDateString("es-ES", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200">
            Bienvenido al Sistema de Punto de Venta
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Selecciona una opción para comenzar
          </p>
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              onClick={(e) => handleMenuClick(item, e)}
              className="group relative overflow-hidden bg-white dark:bg-slate-800 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-slate-200 dark:border-slate-700"
            >
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div
                    className={`${item.color} ${item.hoverColor} p-3 rounded-xl text-white shadow-lg transition-transform duration-300 group-hover:scale-110`}
                  >
                    <item.icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      {item.description}
                    </p>
                  </div>
                  <svg
                    className="w-5 h-5 text-slate-400 group-hover:text-blue-500 transition-colors group-hover:translate-x-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
              {/* Hover accent line */}
              <div className="absolute bottom-0 left-0 w-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 group-hover:w-full transition-all duration-300" />
            </Link>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Productos
            </p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {products.length}
            </p>
          </div>
          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Ventas Hoy
            </p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              $0.00
            </p>
          </div>
          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Clientes
            </p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              0
            </p>
          </div>
          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Stock Bajo
            </p>
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {
                products.filter(
                  (p) =>
                    p.cantidadInicial <= p.stockMinimo && p.stockMinimo > 0,
                ).length
              }
            </p>
          </div>
        </div>
      </main>

      {/* Search Modal */}
      <SearchProductModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </div>
  );
}
