"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  Calendar,
  Filter,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Target,
  Layers,
  ShoppingBag,
  ChevronRight,
  Download,
  FileText,
  AlertCircle,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { useProducts } from "../components/ProductContext";
import { useSales } from "../components/SalesContext";

type PeriodType = "daily" | "monthly" | "yearly" | "all";
type ViewType = "general" | "categories" | "products" | "projections" | "trends";

export default function ReportsPage() {
  const { products, categories } = useProducts();
  const { sales } = useSales();
  const [period, setPeriod] = useState<PeriodType>("all");
  const [view, setView] = useState<ViewType>("general");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "USD",
    }).format(value);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  // Filtrar ventas por período
  const filteredSales = useMemo(() => {
    if (period === "all") return sales;

    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    return sales.filter((sale) => {
      const saleDate = new Date(sale.fecha);
      if (period === "daily") return saleDate >= startOfDay;
      if (period === "monthly") return saleDate >= startOfMonth;
      if (period === "yearly") return saleDate >= startOfYear;
      return true;
    });
  }, [sales, period]);

  // Estadísticas generales
  const stats = useMemo(() => {
    const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.total, 0);
    const totalProfit = filteredSales.reduce(
      (sum, sale) => sum + sale.totalGanancia,
      0
    );
    const totalCost = filteredSales.reduce(
      (sum, sale) => sum + sale.items.reduce((itemSum, item) => {
        const product = products.find((p) => p.id === item.productId);
        if (product) {
          return itemSum + product.precioInicial * item.cantidad;
        }
        return itemSum;
      }, 0),
      0
    );
    const totalSales = filteredSales.length;
    const totalItems = filteredSales.reduce(
      (sum, sale) => sum + sale.items.reduce((itemSum, item) => itemSum + item.cantidad, 0),
      0
    );

    return {
      totalRevenue,
      totalProfit,
      totalCost,
      totalSales,
      totalItems,
      averageTicket: totalSales > 0 ? totalRevenue / totalSales : 0,
      profitMargin: totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0,
    };
  }, [filteredSales, products]);

  // Análisis por categorías
  const categoryStats = useMemo(() => {
    const categoryMap = new Map<
      string,
      { revenue: number; profit: number; cost: number; items: number; sales: number }
    >();

    filteredSales.forEach((sale) => {
      sale.items.forEach((item) => {
        const product = products.find((p) => p.id === item.productId);
        const itemCost = product ? product.precioInicial * item.cantidad : 0;

        if (!categoryMap.has(item.categoria)) {
          categoryMap.set(item.categoria, {
            revenue: 0,
            profit: 0,
            cost: 0,
            items: 0,
            sales: 0,
          });
        }
        const cat = categoryMap.get(item.categoria)!;
        cat.revenue += item.precioVenta * item.cantidad;
        cat.profit += item.ganancia * item.cantidad;
        cat.cost += itemCost;
        cat.items += item.cantidad;
        cat.sales += 1;
      });
    });

    return Array.from(categoryMap.entries())
      .map(([name, data]) => ({
        name,
        ...data,
        margin: data.revenue > 0 ? (data.profit / data.revenue) * 100 : 0,
      }))
      .sort((a, b) => b.profit - a.profit);
  }, [filteredSales, products]);

  // Análisis de productos
  const productStats = useMemo(() => {
    const filteredProducts =
      selectedCategory === "all"
        ? products
        : products.filter((p) => p.categoria === selectedCategory);

    return filteredProducts.map((product) => {
      const productSales = filteredSales.filter((sale) =>
        sale.items.some((item) => item.productId === product.id)
      );

      const totalSold = productSales.reduce((sum, sale) => {
        const items = sale.items.filter((i) => i.productId === product.id);
        return sum + items.reduce((itemSum, item) => itemSum + item.cantidad, 0);
      }, 0);

      const revenue = totalSold * product.precioVenta;
      const profit = totalSold * product.ganancia;
      const cost = totalSold * product.precioInicial;

      return {
        ...product,
        totalSold,
        revenue,
        profit,
        cost,
        margin: revenue > 0 ? (profit / revenue) * 100 : 0,
      };
    })
      .filter((p) => p.totalSold > 0 || selectedCategory !== "all")
      .sort((a, b) => b.profit - a.profit);
  }, [filteredSales, products, selectedCategory]);

  // Proyecciones - valor total del inventario
  const projections = useMemo(() => {
    const inventoryValue = products.reduce(
      (sum, p) => sum + p.precioInicial * p.cantidadInicial,
      0
    );
    const potentialRevenue = products.reduce(
      (sum, p) => sum + p.precioVenta * p.cantidadInicial,
      0
    );
    const potentialProfit = products.reduce(
      (sum, p) => sum + p.ganancia * p.cantidadInicial,
      0
    );

    // Productos por stock
    const lowStock = products.filter(
      (p) => p.cantidadInicial <= p.stockMinimo && p.stockMinimo > 0
    );
    const outOfStock = products.filter((p) => p.cantidadInicial === 0);

    return {
      inventoryValue,
      potentialRevenue,
      potentialProfit,
      totalProducts: products.length,
      lowStock: lowStock.length,
      outOfStock: outOfStock.length,
      profitMargin:
        potentialRevenue > 0 ? (potentialProfit / potentialRevenue) * 100 : 0,
    };
  }, [products]);

  // Cálculos comparativos (período anterior)
  const comparisons = useMemo(() => {
    const now = new Date();
    const currentStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const previousStart = new Date(currentStart);
    previousStart.setDate(previousStart.getDate() - 1);

    const currentSales = sales.filter(
      (s) => new Date(s.fecha) >= currentStart
    );
    const previousSales = sales.filter((s) => {
      const d = new Date(s.fecha);
      return d >= previousStart && d < currentStart;
    });

    const currentRevenue = currentSales.reduce((sum, s) => sum + s.total, 0);
    const previousRevenue = previousSales.reduce((sum, s) => sum + s.total, 0);

    const currentProfit = currentSales.reduce(
      (sum, s) => sum + s.totalGanancia,
      0
    );
    const previousProfit = previousSales.reduce(
      (sum, s) => sum + s.totalGanancia,
      0
    );

    return {
      revenueChange:
        previousRevenue > 0
          ? ((currentRevenue - previousRevenue) / previousRevenue) * 100
          : 0,
      profitChange:
        previousProfit > 0
          ? ((currentProfit - previousProfit) / previousProfit) * 100
          : 0,
    };
  }, [sales]);

  const periodLabels: Record<PeriodType, string> = {
    daily: "Hoy",
    monthly: "Este mes",
    yearly: "Este año",
    all: "Todo el tiempo",
  };

  // Función para exportar reporte
  const exportReport = () => {
    const reportData = {
      periodo: periodLabels[period],
      fechaGenerado: new Date().toLocaleString("es-ES"),
      estadisticas: {
        ingresosTotales: stats.totalRevenue,
        gananciasNetas: stats.totalProfit,
        costoVentas: stats.totalCost,
        totalVentas: stats.totalSales,
        productosVendidos: stats.totalItems,
        ticketPromedio: stats.averageTicket,
        margenGanancia: stats.profitMargin,
      },
      categorias: categoryStats,
      productos: productStats.slice(0, 50),
      proyecciones: projections,
    };

    const dataStr = JSON.stringify(reportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `reporte-${period}-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Estado de salud del negocio
  const businessHealth = useMemo(() => {
    const health = {
      score: 0,
      status: "neutral" as "good" | "neutral" | "bad",
      messages: [] as string[],
    };

    // Calcular score basado en métricas
    if (stats.profitMargin > 30) health.score += 40;
    else if (stats.profitMargin > 15) health.score += 25;
    else health.score += 10;

    if (projections.lowStock === 0 && projections.outOfStock === 0) health.score += 30;
    else if (projections.outOfStock === 0) health.score += 20;
    else health.score += 5;

    if (stats.totalSales > 0) health.score += 20;

    if (comparisons.profitChange > 0) health.score += 10;
    else if (comparisons.profitChange < -10) health.score -= 5;

    // Determinar status
    if (health.score >= 70) {
      health.status = "good";
      health.messages.push("Las finanzas del negocio están saludables");
    } else if (health.score >= 40) {
      health.status = "neutral";
      health.messages.push("El negocio requiere atención en algunas áreas");
    } else {
      health.status = "bad";
      health.messages.push("Se recomienda revisar la estrategia de precios y costos");
    }

    if (projections.outOfStock > 0) {
      health.messages.push(`${projections.outOfStock} productos agotados - reabastecer urgentemente`);
    }
    if (projections.lowStock > 3) {
      health.messages.push(`${projections.lowStock} productos con stock bajo`);
    }
    if (stats.profitMargin < 15 && stats.totalRevenue > 0) {
      health.messages.push("Margen de ganancia bajo - considerar ajustar precios");
    }

    return health;
  }, [stats, projections, comparisons]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow-sm border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10">
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
                <div className="bg-indigo-500 p-2 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Reportes Financieros
                  </h1>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Análisis completo del negocio
                  </p>
                </div>
              </div>
            </div>

            {/* Period Selector */}
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value as PeriodType)}
                className="bg-slate-100 dark:bg-slate-700 border-0 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-indigo-500"
              >
                <option value="daily">Hoy</option>
                <option value="monthly">Este mes</option>
                <option value="yearly">Este año</option>
                <option value="all">Todo el tiempo</option>
              </select>
              <button
                onClick={exportReport}
                className="flex items-center gap-2 ml-4 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition-colors"
              >
                <Download className="w-4 h-4" />
                Exportar
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* View Tabs */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-2 mb-6">
          <div className="flex flex-wrap gap-2">
            {[
              { key: "general", label: "General", icon: PieChart },
              { key: "categories", label: "Por Categoría", icon: Layers },
              { key: "products", label: "Por Producto", icon: Package },
              { key: "projections", label: "Proyecciones", icon: Target },
              { key: "trends", label: "Tendencias", icon: TrendingUp },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setView(key as ViewType)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  view === key
                    ? "bg-indigo-500 text-white shadow-md"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* GENERAL VIEW */}
        {view === "general" && (
          <>
            {/* Business Health Summary */}
            <div className={`mb-6 p-4 rounded-xl border ${
              businessHealth.status === "good"
                ? "bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800"
                : businessHealth.status === "neutral"
                ? "bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800"
                : "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800"
            }`}>
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg ${
                  businessHealth.status === "good"
                    ? "bg-emerald-100 dark:bg-emerald-800"
                    : businessHealth.status === "neutral"
                    ? "bg-amber-100 dark:bg-amber-800"
                    : "bg-red-100 dark:bg-red-800"
                }`}>
                  {businessHealth.status === "good" ? (
                    <CheckCircle2 className={`w-6 h-6 text-emerald-600 dark:text-emerald-400`} />
                  ) : businessHealth.status === "neutral" ? (
                    <AlertCircle className={`w-6 h-6 text-amber-600 dark:text-amber-400`} />
                  ) : (
                    <AlertCircle className={`w-6 h-6 text-red-600 dark:text-red-400`} />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className={`font-semibold ${
                      businessHealth.status === "good"
                        ? "text-emerald-800 dark:text-emerald-400"
                        : businessHealth.status === "neutral"
                        ? "text-amber-800 dark:text-amber-400"
                        : "text-red-800 dark:text-red-400"
                    }`}>
                      Estado del Negocio: {businessHealth.score}/100
                    </h3>
                    <div className="flex-1 max-w-xs">
                      <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            businessHealth.status === "good"
                              ? "bg-emerald-500"
                              : businessHealth.status === "neutral"
                              ? "bg-amber-500"
                              : "bg-red-500"
                          }`}
                          style={{ width: `${businessHealth.score}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  <ul className="space-y-1">
                    {businessHealth.messages.map((msg, i) => (
                      <li key={i} className={`text-sm flex items-center gap-2 ${
                        businessHealth.status === "good"
                          ? "text-emerald-700 dark:text-emerald-300"
                          : businessHealth.status === "neutral"
                          ? "text-amber-700 dark:text-amber-300"
                          : "text-red-700 dark:text-red-300"
                      }`}>
                        <ChevronRight className="w-3 h-3" />
                        {msg}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {/* Revenue */}
              <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                    <DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <span
                    className={`flex items-center gap-1 text-sm font-medium ${
                      comparisons.revenueChange >= 0
                        ? "text-emerald-600"
                        : "text-red-600"
                    }`}
                  >
                    {comparisons.revenueChange >= 0 ? (
                      <ArrowUpRight className="w-4 h-4" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4" />
                    )}
                    {Math.abs(comparisons.revenueChange).toFixed(1)}%
                  </span>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Ingresos Totales
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {formatCurrency(stats.totalRevenue)}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  {periodLabels[period]}
                </p>
              </div>

              {/* Profit */}
              <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span
                    className={`flex items-center gap-1 text-sm font-medium ${
                      comparisons.profitChange >= 0
                        ? "text-emerald-600"
                        : "text-red-600"
                    }`}
                  >
                    {comparisons.profitChange >= 0 ? (
                      <ArrowUpRight className="w-4 h-4" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4" />
                    )}
                    {Math.abs(comparisons.profitChange).toFixed(1)}%
                  </span>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Ganancias Netas
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {formatCurrency(stats.totalProfit)}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Margen: {stats.profitMargin.toFixed(1)}%
                </p>
              </div>

              {/* Sales Count */}
              <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-violet-100 dark:bg-violet-900/30 rounded-lg">
                    <ShoppingBag className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                  </div>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Total Ventas
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {stats.totalSales}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  {stats.totalItems} productos vendidos
                </p>
              </div>

              {/* Average Ticket */}
              <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                    <Wallet className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  </div>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Ticket Promedio
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {formatCurrency(stats.averageTicket)}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Por venta
                </p>
              </div>
            </div>

            {/* Cost Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <TrendingDown className="w-5 h-5 text-red-500" />
                  Análisis de Costos
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                    <span className="text-slate-600 dark:text-slate-400">
                      Costo de Ventas
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {formatCurrency(stats.totalCost)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                    <span className="text-slate-600 dark:text-slate-400">
                      Ingresos por Ventas
                    </span>
                    <span className="font-semibold text-emerald-600">
                      {formatCurrency(stats.totalRevenue)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                    <span className="font-medium text-emerald-700 dark:text-emerald-400">
                      Ganancia Neta
                    </span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(stats.totalProfit)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Top Categories */}
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-indigo-500" />
                  Categorías Más Rentables
                </h3>
                {categoryStats.length === 0 ? (
                  <p className="text-slate-500 dark:text-slate-400 text-center py-8">
                    No hay datos suficientes
                  </p>
                ) : (
                  <div className="space-y-3">
                    {categoryStats.slice(0, 5).map((cat, index) => (
                      <div
                        key={cat.name}
                        className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                              index === 0
                                ? "bg-amber-100 text-amber-700"
                                : index === 1
                                ? "bg-slate-200 text-slate-700"
                                : index === 2
                                ? "bg-orange-100 text-orange-700"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            {index + 1}
                          </span>
                          <span className="font-medium text-slate-700 dark:text-slate-300">
                            {cat.name}
                          </span>
                        </div>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(cat.profit)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* CATEGORIES VIEW */}
        {view === "categories" && (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Desempeño por Categoría
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {periodLabels[period]}
              </p>
            </div>
            {categoryStats.length === 0 ? (
              <div className="p-12 text-center">
                <Layers className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">
                  No hay datos de categorías
                </h3>
                <p className="text-slate-500 dark:text-slate-400">
                  Realiza ventas para ver el análisis por categoría
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-200 dark:divide-slate-700">
                {categoryStats.map((cat) => (
                  <div
                    key={cat.name}
                    className="p-6 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <h4 className="font-semibold text-slate-900 dark:text-white text-lg">
                          {cat.name}
                        </h4>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {cat.items} unidades vendidas en {cat.sales} ventas
                        </p>
                      </div>
                      <div className="grid grid-cols-3 gap-4 md:gap-8 text-right">
                        <div>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Ingresos
                          </p>
                          <p className="font-semibold text-slate-900 dark:text-white">
                            {formatCurrency(cat.revenue)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Ganancia
                          </p>
                          <p className="font-semibold text-emerald-600 dark:text-emerald-400">
                            {formatCurrency(cat.profit)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Margen
                          </p>
                          <p className="font-semibold text-blue-600 dark:text-blue-400">
                            {cat.margin.toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PRODUCTS VIEW */}
        {view === "products" && (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    Desempeño por Producto
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {periodLabels[period]}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-slate-400" />
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="bg-slate-100 dark:bg-slate-700 border-0 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="all">Todas las categorías</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            {productStats.length === 0 ? (
              <div className="p-12 text-center">
                <Package className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">
                  No hay datos de productos
                </h3>
                <p className="text-slate-500 dark:text-slate-400">
                  Realiza ventas para ver el análisis por producto
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-200 dark:divide-slate-700">
                {productStats.slice(0, 20).map((product) => (
                  <div
                    key={product.id}
                    className="p-6 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <h4 className="font-semibold text-slate-900 dark:text-white">
                          {product.nombre}
                        </h4>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {product.categoria} • {product.totalSold} vendidos
                        </p>
                      </div>
                      <div className="grid grid-cols-4 gap-4 md:gap-8 text-right">
                        <div>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Precio
                          </p>
                          <p className="font-medium text-slate-900 dark:text-white">
                            {formatCurrency(product.precioVenta)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Costo
                          </p>
                          <p className="font-medium text-slate-600 dark:text-slate-400">
                            {formatCurrency(product.cost)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Ganancia
                          </p>
                          <p className="font-semibold text-emerald-600 dark:text-emerald-400">
                            {formatCurrency(product.profit)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Margen
                          </p>
                          <p className="font-semibold text-blue-600 dark:text-blue-400">
                            {product.margin.toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TRENDS VIEW */}
        {view === "trends" && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Comparación Períodos */}
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-indigo-500" />
                  Comparación de Períodos
                </h3>
                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-slate-600 dark:text-slate-400">Cambio en Ingresos</span>
                      <span className={`font-semibold ${comparisons.revenueChange >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                        {comparisons.revenueChange >= 0 ? "+" : ""}{comparisons.revenueChange.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${comparisons.revenueChange >= 0 ? "bg-emerald-500" : "bg-red-500"}`}
                        style={{ width: `${Math.min(Math.abs(comparisons.revenueChange), 100)}%` }}
                      />
                    </div>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-slate-600 dark:text-slate-400">Cambio en Ganancias</span>
                      <span className={`font-semibold ${comparisons.profitChange >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                        {comparisons.profitChange >= 0 ? "+" : ""}{comparisons.profitChange.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${comparisons.profitChange >= 0 ? "bg-emerald-500" : "bg-red-500"}`}
                        style={{ width: `${Math.min(Math.abs(comparisons.profitChange), 100)}%` }}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="text-center p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                      <p className="text-sm text-emerald-600 dark:text-emerald-400">Días con Ventas</p>
                      <p className="text-xl font-bold text-emerald-700 dark:text-emerald-400">
                        {new Set(sales.map(s => new Date(s.fecha).toDateString())).size}
                      </p>
                    </div>
                    <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-sm text-blue-600 dark:text-blue-400">Promedio/Día</p>
                      <p className="text-xl font-bold text-blue-700 dark:text-blue-400">
                        {formatCurrency(stats.totalRevenue / Math.max(new Set(sales.map(s => new Date(s.fecha).toDateString())).size, 1))}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Productos Más Vendidos */}
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-500" />
                  Top 5 Productos Más Vendidos
                </h3>
                <div className="space-y-3">
                  {productStats
                    .filter(p => p.totalSold > 0)
                    .sort((a, b) => b.totalSold - a.totalSold)
                    .slice(0, 5)
                    .map((product, index) => (
                      <div key={product.id} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                        <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          index === 0 ? "bg-amber-100 text-amber-700" :
                          index === 1 ? "bg-slate-200 text-slate-700" :
                          index === 2 ? "bg-orange-100 text-orange-700" :
                          "bg-slate-100 text-slate-500"
                        }`}>
                          {index + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-900 dark:text-white truncate">{product.nombre}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{product.totalSold} vendidos</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-emerald-600 dark:text-emerald-400">{formatCurrency(product.profit)}</p>
                          <p className="text-xs text-slate-400">ganancia</p>
                        </div>
                      </div>
                    ))}
                  {productStats.filter(p => p.totalSold > 0).length === 0 && (
                    <p className="text-center text-slate-500 dark:text-slate-400 py-8">No hay datos de ventas aún</p>
                  )}
                </div>
              </div>
            </div>

            {/* Resumen Detallado */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-500" />
                Resumen Ejecutivo
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                  <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-2">Rendimiento</h4>
                  <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                    <li className="flex justify-between">
                      <span>Margen Promedio:</span>
                      <span className="font-medium text-slate-900 dark:text-white">{stats.profitMargin.toFixed(1)}%</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Ticket Promedio:</span>
                      <span className="font-medium text-slate-900 dark:text-white">{formatCurrency(stats.averageTicket)}</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Productos/Sale:</span>
                      <span className="font-medium text-slate-900 dark:text-white">{stats.totalSales > 0 ? (stats.totalItems / stats.totalSales).toFixed(1) : 0}</span>
                    </li>
                  </ul>
                </div>
                <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                  <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-2">Inventario</h4>
                  <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                    <li className="flex justify-between">
                      <span>Total Productos:</span>
                      <span className="font-medium text-slate-900 dark:text-white">{products.length}</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Con Stock Bajo:</span>
                      <span className={`font-medium ${projections.lowStock > 0 ? "text-amber-600" : ""}`}>{projections.lowStock}</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Agotados:</span>
                      <span className={`font-medium ${projections.outOfStock > 0 ? "text-red-600" : ""}`}>{projections.outOfStock}</span>
                    </li>
                  </ul>
                </div>
                <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                  <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-2">Proyecciones</h4>
                  <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                    <li className="flex justify-between">
                      <span>Valor Inventario:</span>
                      <span className="font-medium text-slate-900 dark:text-white">{formatCurrency(projections.inventoryValue)}</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Ingresos Potenciales:</span>
                      <span className="font-medium text-emerald-600">{formatCurrency(projections.potentialRevenue)}</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Ganancia Potencial:</span>
                      <span className="font-medium text-emerald-600">{formatCurrency(projections.potentialProfit)}</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </>
        )}

        {/* PROJECTIONS VIEW */}
        {view === "projections" && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {/* Inventory Value */}
              <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg w-fit mb-4">
                  <Package className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Valor del Inventario
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {formatCurrency(projections.inventoryValue)}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Costo total de productos
                </p>
              </div>

              {/* Potential Revenue */}
              <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg w-fit mb-4">
                  <DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Ingresos Potenciales
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {formatCurrency(projections.potentialRevenue)}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Si se vende todo el stock
                </p>
              </div>

              {/* Potential Profit */}
              <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg w-fit mb-4">
                  <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Ganancia Potencial
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {formatCurrency(projections.potentialProfit)}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Margen: {projections.profitMargin.toFixed(1)}%
                </p>
              </div>

              {/* Stock Status */}
              <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="p-2 bg-violet-100 dark:bg-violet-900/30 rounded-lg w-fit mb-4">
                  <Layers className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Estado del Inventario
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {projections.totalProducts}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  {projections.lowStock} stock bajo • {projections.outOfStock} agotado
                </p>
              </div>
            </div>

            {/* ROI Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-indigo-500" />
                  Retorno de Inversión (ROI)
                </h3>
                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-slate-600 dark:text-slate-400">
                        Inversión Actual
                      </span>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {formatCurrency(projections.inventoryValue)}
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2">
                      <div className="bg-slate-400 h-2 rounded-full" style={{ width: "100%" }} />
                    </div>
                  </div>
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-emerald-700 dark:text-emerald-400 font-medium">
                        Ganancia Esperada
                      </span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(projections.potentialProfit)}
                      </span>
                    </div>
                    <div className="w-full bg-emerald-200 dark:bg-emerald-800 rounded-full h-2">
                      <div
                        className="bg-emerald-500 h-2 rounded-full"
                        style={{
                          width: `${Math.min(
                            (projections.potentialProfit / projections.inventoryValue) * 100,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                    <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-2">
                      ROI: {projections.inventoryValue > 0
                        ? ((projections.potentialProfit / projections.inventoryValue) * 100).toFixed(1)
                        : 0}%
                    </p>
                  </div>
                </div>
              </div>

              {/* Stock Alerts */}
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <TrendingDown className="w-5 h-5 text-amber-500" />
                  Alertas de Inventario
                </h3>
                <div className="space-y-4">
                  {projections.outOfStock > 0 && (
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-100 dark:bg-red-800 rounded-lg">
                          <Package className="w-5 h-5 text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                          <p className="font-semibold text-red-700 dark:text-red-400">
                            {projections.outOfStock} productos agotados
                          </p>
                          <p className="text-sm text-red-600 dark:text-red-300">
                            Reabastecer lo antes posible
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  {projections.lowStock > 0 && (
                    <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-100 dark:bg-amber-800 rounded-lg">
                          <TrendingDown className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div>
                          <p className="font-semibold text-amber-700 dark:text-amber-400">
                            {projections.lowStock} productos con stock bajo
                          </p>
                          <p className="text-sm text-amber-600 dark:text-amber-300">
                            Considerar reabastecimiento
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  {projections.outOfStock === 0 && projections.lowStock === 0 && (
                    <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-100 dark:bg-emerald-800 rounded-lg">
                          <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                          <p className="font-semibold text-emerald-700 dark:text-emerald-400">
                            Inventario en buen estado
                          </p>
                          <p className="text-sm text-emerald-600 dark:text-emerald-300">
                            No hay productos agotados ni con stock bajo
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
