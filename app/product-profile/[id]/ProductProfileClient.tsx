"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Package,
  BarChart3,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Calendar,
  Tag,
  AlertCircle,
} from "lucide-react";
import { useProducts } from "../../components/ProductContext";
import { useSales } from "../../components/SalesContext";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { useMemo, useState } from "react";

// Generate daily sales data based on actual sales
function useProductSalesData(productId: string) {
  const { sales } = useSales();

  return useMemo(() => {
    // Filter sales that include this product
    const productSales = sales.filter((sale) =>
      sale.items.some((item) => item.productId === productId)
    );

    // Group by date
    const salesByDate = new Map<string, { quantity: number; revenue: number; profit: number }>();

    productSales.forEach((sale) => {
      const date = new Date(sale.fecha).toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "short",
      });

      const items = sale.items.filter((item) => item.productId === productId);
      const quantity = items.reduce((sum, item) => sum + item.cantidad, 0);
      const revenue = items.reduce((sum, item) => sum + item.precioVenta * item.cantidad, 0);
      const profit = items.reduce((sum, item) => sum + item.ganancia * item.cantidad, 0);

      if (salesByDate.has(date)) {
        const existing = salesByDate.get(date)!;
        salesByDate.set(date, {
          quantity: existing.quantity + quantity,
          revenue: existing.revenue + revenue,
          profit: existing.profit + profit,
        });
      } else {
        salesByDate.set(date, { quantity, revenue, profit });
      }
    });

    // Convert to array and sort by date
    const sortedDates = Array.from(salesByDate.entries())
      .map(([date, data]) => ({
        date,
        quantity: data.quantity,
        revenue: data.revenue,
        profit: data.profit,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return sortedDates;
  }, [sales, productId]);
}

// Generate monthly aggregated data for year view
function useMonthlySalesData(productId: string) {
  const { sales } = useSales();

  return useMemo(() => {
    const productSales = sales.filter((sale) =>
      sale.items.some((item) => item.productId === productId)
    );

    const salesByMonth = new Map<string, { quantity: number; revenue: number; profit: number }>();

    productSales.forEach((sale) => {
      const date = new Date(sale.fecha);
      const monthKey = date.toLocaleDateString("es-ES", {
        month: "short",
        year: "2-digit",
      });

      const items = sale.items.filter((item) => item.productId === productId);
      const quantity = items.reduce((sum, item) => sum + item.cantidad, 0);
      const revenue = items.reduce((sum, item) => sum + item.precioVenta * item.cantidad, 0);
      const profit = items.reduce((sum, item) => sum + item.ganancia * item.cantidad, 0);

      if (salesByMonth.has(monthKey)) {
        const existing = salesByMonth.get(monthKey)!;
        salesByMonth.set(monthKey, {
          quantity: existing.quantity + quantity,
          revenue: existing.revenue + revenue,
          profit: existing.profit + profit,
        });
      } else {
        salesByMonth.set(monthKey, { quantity, revenue, profit });
      }
    });

    return Array.from(salesByMonth.entries()).map(([date, data]) => ({
      date,
      quantity: data.quantity,
      revenue: data.revenue,
      profit: data.profit,
    }));
  }, [sales, productId]);
}

type TimeRange = "daily" | "monthly";

export default function ProductProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { products } = useProducts();
  const { sales } = useSales();
  const [timeRange, setTimeRange] = useState<TimeRange>("daily");
  const [chartMetric, setChartMetric] = useState<"quantity" | "revenue" | "profit">("revenue");

  const productId = params.id as string;
  const product = products.find((p) => p.id === productId);

  const dailyData = useProductSalesData(productId);
  const monthlyData = useMonthlySalesData(productId);

  // Calculate total sales for this product from sales history
  const salesStats = useMemo(() => {
    const productSales = sales.filter((sale) =>
      sale.items.some((item) => item.productId === productId)
    );

    let totalUnits = 0;
    let totalRevenue = 0;
    let totalProfit = 0;

    productSales.forEach((sale) => {
      const items = sale.items.filter((item) => item.productId === productId);
      items.forEach((item) => {
        totalUnits += item.cantidad;
        totalRevenue += item.precioVenta * item.cantidad;
        totalProfit += item.ganancia * item.cantidad;
      });
    });

    return { totalUnits, totalRevenue, totalProfit, transactionCount: productSales.length };
  }, [sales, productId]);

  const chartData = timeRange === "daily" ? dailyData : monthlyData;

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "USD",
    }).format(value);

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 text-center">
            <AlertCircle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              Producto no encontrado
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              El producto que buscas no existe o ha sido eliminado.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isLowStock = product.cantidadInicial <= product.stockMinimo && product.stockMinimo > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow-sm border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-slate-600 dark:text-slate-400" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Perfil del Producto
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Detalles y estadísticas de ventas
                </p>
              </div>
            </div>
            <Link
              href="/inventory"
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              Ver en inventario
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Product Info Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6">
            <div className="flex items-start justify-between">
              <div>
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-white/20 text-white text-sm rounded-full mb-3">
                  <Tag className="w-3 h-3" />
                  {product.categoria}
                </span>
                <h2 className="text-3xl font-bold text-white">{product.nombre}</h2>
                <p className="text-white/80 mt-1">ID: {product.id}</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-white">
                  {formatCurrency(product.precioVenta)}
                </p>
                <p className="text-white/80 text-sm">Precio de venta</p>
              </div>
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Stock Info */}
            <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
              <div className={`p-3 rounded-lg ${isLowStock ? "bg-amber-100 dark:bg-amber-900/30" : "bg-emerald-100 dark:bg-emerald-900/30"}`}>
                <Package className={`w-6 h-6 ${isLowStock ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"}`} />
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Stock Actual</p>
                <p className={`text-xl font-bold ${isLowStock ? "text-amber-600 dark:text-amber-400" : "text-slate-900 dark:text-white"}`}>
                  {product.cantidadInicial} unidades
                </p>
                {isLowStock && (
                  <p className="text-xs text-amber-600 dark:text-amber-400">¡Stock bajo!</p>
                )}
              </div>
            </div>

            {/* Cost Info */}
            <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <DollarSign className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Precio de Costo</p>
                <p className="text-xl font-bold text-slate-900 dark:text-white">
                  {formatCurrency(product.precioInicial)}
                </p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400">
                  Ganancia: {formatCurrency(product.ganancia)} por unidad
                </p>
              </div>
            </div>

            {/* Barcode */}
            <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
              <div className="p-3 bg-violet-100 dark:bg-violet-900/30 rounded-lg">
                <BarChart3 className="w-6 h-6 text-violet-600 dark:text-violet-400" />
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Código de Barras</p>
                <p className="text-lg font-mono font-bold text-slate-900 dark:text-white">
                  {product.codigoBarra || "N/A"}
                </p>
              </div>
            </div>

            {/* Creation Date */}
            <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
              <div className="p-3 bg-rose-100 dark:bg-rose-900/30 rounded-lg">
                <Calendar className="w-6 h-6 text-rose-600 dark:text-rose-400" />
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Fecha de Creación</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white">
                  {new Date(product.fechaCreacion).toLocaleDateString("es-ES")}
                </p>
              </div>
            </div>
          </div>

          {/* Stock Levels */}
          <div className="px-6 pb-6">
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-slate-500 dark:text-slate-400">Stock Mínimo:</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {product.stockMinimo}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-500 dark:text-slate-400">Stock Máximo:</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {product.stockMaximo}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Sales Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <ShoppingCart className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Ventas Totales</p>
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">
              {salesStats.totalUnits}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">unidades vendidas</p>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Ganancias Totales</p>
            </div>
            <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
              {formatCurrency(salesStats.totalProfit)}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">desde creación</p>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-violet-100 dark:bg-violet-900/30 rounded-lg">
                <DollarSign className="w-5 h-5 text-violet-600 dark:text-violet-400" />
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Ingresos Totales</p>
            </div>
            <p className="text-3xl font-bold text-violet-600 dark:text-violet-400">
              {formatCurrency(salesStats.totalRevenue)}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">ventas acumuladas</p>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                <BarChart3 className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Transacciones</p>
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">
              {salesStats.transactionCount}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">ventas registradas</p>
          </div>
        </div>

        {/* Sales Chart */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Historial de Ventas
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Tendencia de ventas a lo largo del tiempo
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {/* Time Range Selector */}
              <div className="flex bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
                <button
                  onClick={() => setTimeRange("daily")}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                    timeRange === "daily"
                      ? "bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  Diario
                </button>
                <button
                  onClick={() => setTimeRange("monthly")}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                    timeRange === "monthly"
                      ? "bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  Mensual
                </button>
              </div>

              {/* Metric Selector */}
              <div className="flex bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
                <button
                  onClick={() => setChartMetric("revenue")}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                    chartMetric === "revenue"
                      ? "bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  Ingresos
                </button>
                <button
                  onClick={() => setChartMetric("profit")}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                    chartMetric === "profit"
                      ? "bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  Ganancias
                </button>
                <button
                  onClick={() => setChartMetric("quantity")}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                    chartMetric === "quantity"
                      ? "bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  Unidades
                </button>
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="h-80 w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor={
                          chartMetric === "quantity"
                            ? "#8b5cf6"
                            : chartMetric === "profit"
                            ? "#10b981"
                            : "#3b82f6"
                        }
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="95%"
                        stopColor={
                          chartMetric === "quantity"
                            ? "#8b5cf6"
                            : chartMetric === "profit"
                            ? "#10b981"
                            : "#3b82f6"
                        }
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" dark-stroke="#334155" />
                  <XAxis
                    dataKey="date"
                    stroke="#64748b"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#64748b"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) =>
                      chartMetric === "quantity" ? value : `$${value}`
                    }
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.95)",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    }}
                    formatter={(value) => {
                      const numValue = typeof value === 'number' ? value : Number(value) || 0;
                      const label = chartMetric === "quantity"
                        ? "Cantidad"
                        : chartMetric === "profit"
                        ? "Ganancia"
                        : "Ingresos";
                      const formattedValue = chartMetric === "quantity"
                        ? `${numValue} unidades`
                        : formatCurrency(numValue);
                      return [formattedValue, label];
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey={chartMetric}
                    stroke={
                      chartMetric === "quantity"
                        ? "#8b5cf6"
                        : chartMetric === "profit"
                        ? "#10b981"
                        : "#3b82f6"
                    }
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorMetric)"
                    animationDuration={1500}
                    animationBegin={0}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <BarChart3 className="w-16 h-16 mb-4 opacity-50" />
                <p className="text-lg font-medium">No hay datos de ventas</p>
                <p className="text-sm">
                  Las ventas de este producto aparecerán aquí
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
