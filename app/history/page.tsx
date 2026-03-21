"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  History,
  Plus,
  Trash2,
  Edit,
  ShoppingCart,
  Package,
  User,
  Calendar,
  Filter,
  Search,
  TrendingUp,
  X,
  ChevronRight,
} from "lucide-react";
import { useActivity, ActivityType } from "../components/ActivityContext";
import { useProducts } from "../components/ProductContext";

type FilterType = "all" | ActivityType;

const activityConfig: Record<
  ActivityType,
  {
    label: string;
    icon: typeof Plus;
    color: string;
    bgColor: string;
    description: string;
  }
> = {
  created: {
    label: "Creado",
    icon: Plus,
    color: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-100 dark:bg-emerald-900/30",
    description: "Producto creado",
  },
  updated: {
    label: "Modificado",
    icon: Edit,
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
    description: "Producto modificado",
  },
  deleted: {
    label: "Eliminado",
    icon: Trash2,
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-100 dark:bg-red-900/30",
    description: "Producto eliminado",
  },
  sold: {
    label: "Vendido",
    icon: ShoppingCart,
    color: "text-violet-600 dark:text-violet-400",
    bgColor: "bg-violet-100 dark:bg-violet-900/30",
    description: "Producto vendido",
  },
  restocked: {
    label: "Reabastecido",
    icon: Package,
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-100 dark:bg-amber-900/30",
    description: "Stock agregado",
  },
};

export default function HistoryPage() {
  const router = useRouter();
  const { activities } = useActivity();
  const { products } = useProducts();
  const [filter, setFilter] = useState<FilterType>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredActivities = useMemo(() => {
    let filtered = activities;

    // Filtrar por tipo
    if (filter !== "all") {
      filtered = filtered.filter((a) => a.type === filter);
    }

    // Filtrar por búsqueda
    if (searchTerm.trim()) {
      const query = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          a.productName.toLowerCase().includes(query) ||
          a.details.toLowerCase().includes(query) ||
          a.user.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [activities, filter, searchTerm]);

  // Estadísticas
  const stats = useMemo(() => {
    const total = activities.length;
    const created = activities.filter((a) => a.type === "created").length;
    const updated = activities.filter((a) => a.type === "updated").length;
    const deleted = activities.filter((a) => a.type === "deleted").length;
    const sold = activities.filter((a) => a.type === "sold").length;
    const totalSold = activities
      .filter((a) => a.type === "sold")
      .reduce((sum, a) => sum + (a.quantity || 0), 0);

    return { total, created, updated, deleted, sold, totalSold };
  }, [activities]);

  const formatCurrency = (value?: number) =>
    new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "USD",
    }).format(value || 0);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return "Hace minutos";
    } else if (diffInHours < 24) {
      const hours = Math.floor(diffInHours);
      return `Hace ${hours} hora${hours > 1 ? "s" : ""}`;
    } else if (diffInHours < 48) {
      return "Ayer";
    } else {
      return date.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  };

  const getFilterLabel = (type: FilterType) => {
    if (type === "all") return "Todas las actividades";
    return activityConfig[type].description;
  };

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
                <div className="bg-rose-500 p-2 rounded-lg">
                  <History className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Historial de Actividades
                  </h1>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {stats.total} actividad{stats.total !== 1 ? "es" : ""} registrada
                    {stats.total !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2 mb-1">
              <History className="w-4 h-4 text-slate-400" />
              <p className="text-sm text-slate-500 dark:text-slate-400">Total</p>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total}</p>
          </div>

          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2 mb-1">
              <Plus className="w-4 h-4 text-emerald-500" />
              <p className="text-sm text-slate-500 dark:text-slate-400">Creados</p>
            </div>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats.created}</p>
          </div>

          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2 mb-1">
              <Edit className="w-4 h-4 text-blue-500" />
              <p className="text-sm text-slate-500 dark:text-slate-400">Modificados</p>
            </div>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.updated}</p>
          </div>

          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2 mb-1">
              <ShoppingCart className="w-4 h-4 text-violet-500" />
              <p className="text-sm text-slate-500 dark:text-slate-400">Ventas</p>
            </div>
            <p className="text-2xl font-bold text-violet-600 dark:text-violet-400">{stats.sold}</p>
            <p className="text-xs text-slate-500">{stats.totalSold} unidades</p>
          </div>

          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2 mb-1">
              <Trash2 className="w-4 h-4 text-red-500" />
              <p className="text-sm text-slate-500 dark:text-slate-400">Eliminados</p>
            </div>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.deleted}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Filter Tabs */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <Filter className="w-4 h-4" />
                Filtrar:
              </span>
              {[
                { key: "all", label: "Todo", color: "bg-slate-500" },
                { key: "created", label: "Creados", color: "bg-emerald-500" },
                { key: "updated", label: "Modificados", color: "bg-blue-500" },
                { key: "sold", label: "Vendidos", color: "bg-violet-500" },
                { key: "deleted", label: "Eliminados", color: "bg-red-500" },
              ].map(({ key, label, color }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key as FilterType)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${
                    filter === key
                      ? `${color} text-white shadow-md`
                      : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-8 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-colors"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 hover:bg-slate-200 dark:hover:bg-slate-600 rounded transition-colors"
                >
                  <X className="w-3 h-3 text-slate-400" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Activities List */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700 overflow-hidden">
          {activities.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center">
                <History className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
                No hay actividades registradas
              </h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6">
                Las acciones realizadas en productos aparecerán aquí
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3 bg-rose-500 hover:bg-rose-600 text-white font-medium rounded-xl transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Volver al inicio
              </Link>
            </div>
          ) : filteredActivities.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center">
                <Filter className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
                No se encontraron actividades
              </h3>
              <p className="text-slate-500 dark:text-slate-400">
                Intenta con otros filtros o términos de búsqueda
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200 dark:divide-slate-700">
              {filteredActivities.map((activity) => {
                const config = activityConfig[activity.type];
                const Icon = config.icon;
                const isDeletedProduct = activity.type === "deleted";

                return (
                  <div
                    key={activity.id}
                    className="p-4 md:p-6 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className={`p-3 rounded-xl ${config.bgColor} shrink-0`}>
                        <Icon className={`w-5 h-5 ${config.color}`} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-slate-900 dark:text-white">
                                {activity.type === "deleted" ? (
                                  <>
                                    {activity.productName}{" "}
                                    <span className="text-slate-500 font-normal">(eliminado)</span>
                                  </>
                                ) : (
                                  <button
                                    onClick={() => router.push(`/product-profile/${activity.productId}`)}
                                    className="hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                                  >
                                    {activity.productName}
                                  </button>
                                )}
                              </span>
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${config.bgColor} ${config.color}`}
                              >
                                {config.label}
                              </span>
                            </div>
                            <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
                              {activity.details}
                            </p>
                          </div>

                          <div className="text-right shrink-0">
                            <p className="text-sm font-medium text-slate-900 dark:text-white">
                              {formatDate(activity.timestamp)}
                            </p>
                            <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                              <User className="w-3 h-3" />
                              {activity.user}
                            </div>
                          </div>
                        </div>

                        {/* Additional Info */}
                        {(activity.quantity !== undefined || activity.amount !== undefined) && (
                          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                            {activity.quantity !== undefined && (
                              <div className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-400">
                                <Package className="w-4 h-4" />
                                <span>{activity.quantity} unidades</span>
                              </div>
                            )}
                            {activity.amount !== undefined && activity.amount > 0 && (
                              <div className="flex items-center gap-1 text-sm">
                                <TrendingUp className="w-4 h-4 text-emerald-500" />
                                <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                                  {formatCurrency(activity.amount)}
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Summary Footer */}
        {filteredActivities.length > 0 && (
          <div className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
            Mostrando {filteredActivities.length} de {activities.length} actividades
            {filter !== "all" && ` (${getFilterLabel(filter)})`}
          </div>
        )}
      </main>
    </div>
  );
}
