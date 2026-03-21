"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Package,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Trash2,
  Edit,
  Plus,
  Eye,
  ExternalLink,
} from "lucide-react";
import { useProducts, Product } from "../components/ProductContext";

type SortField =
  | "nombre"
  | "categoria"
  | "precioInicial"
  | "precioVenta"
  | "ganancia"
  | "cantidadInicial";
type SortDirection = "asc" | "desc";

export default function InventoryPage() {
  const router = useRouter();
  const { products, deleteProduct } = useProducts();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField>("nombre");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products.filter(
      (product) =>
        product.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.categoria.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.codigoBarra.includes(searchTerm)
    );

    filtered.sort((a, b) => {
      let aValue: string | number = a[sortField];
      let bValue: string | number = b[sortField];

      if (typeof aValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = (bValue as string).toLowerCase();
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [products, searchTerm, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-4 h-4 text-slate-400" />;
    }
    return sortDirection === "asc" ? (
      <ArrowUp className="w-4 h-4 text-blue-500" />
    ) : (
      <ArrowDown className="w-4 h-4 text-blue-500" />
    );
  };

  const handleDelete = (id: string, nombre: string) => {
    if (confirm(`¿Estás seguro de eliminar "${nombre}"?`)) {
      deleteProduct(id);
    }
  };

  const handleEdit = (productId: string) => {
    router.push(`/edit-product/${productId}`);
  };

  const handleViewProfile = (productId: string) => {
    router.push(`/product-profile/${productId}`);
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
                <div className="bg-amber-500 p-2 rounded-lg">
                  <Package className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Inventario
                  </h1>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {products.length} producto{products.length !== 1 ? "s" : ""} registrado
                    {products.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
            </div>

            <Link
              href="/add-product"
              className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5" />
              Agregar Producto
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por nombre, categoría o código..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
            />
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700 overflow-hidden">
          {products.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center">
                <Package className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
                No hay productos registrados
              </h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6">
                Comienza agregando tu primer producto al inventario
              </p>
              <Link
                href="/add-product"
                className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-xl transition-colors"
              >
                <Plus className="w-5 h-5" />
                Agregar Producto
              </Link>
            </div>
          ) : filteredAndSortedProducts.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center">
                <Search className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
                No se encontraron resultados
              </h3>
              <p className="text-slate-500 dark:text-slate-400">
                Intenta con otros términos de búsqueda
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th
                      className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                      onClick={() => handleSort("nombre")}
                    >
                      <div className="flex items-center gap-2">
                        Producto
                        {getSortIcon("nombre")}
                      </div>
                    </th>
                    <th
                      className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                      onClick={() => handleSort("categoria")}
                    >
                      <div className="flex items-center gap-2">
                        Categoría
                        {getSortIcon("categoria")}
                      </div>
                    </th>
                    <th
                      className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                      onClick={() => handleSort("precioInicial")}
                    >
                      <div className="flex items-center gap-2">
                        Precio Inicial
                        {getSortIcon("precioInicial")}
                      </div>
                    </th>
                    <th
                      className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                      onClick={() => handleSort("precioVenta")}
                    >
                      <div className="flex items-center gap-2">
                        Precio Venta
                        {getSortIcon("precioVenta")}
                      </div>
                    </th>
                    <th
                      className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                      onClick={() => handleSort("ganancia")}
                    >
                      <div className="flex items-center gap-2">
                        Ganancia
                        {getSortIcon("ganancia")}
                      </div>
                    </th>
                    <th
                      className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                      onClick={() => handleSort("cantidadInicial")}
                    >
                      <div className="flex items-center gap-2">
                        Cantidad
                        {getSortIcon("cantidadInicial")}
                      </div>
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {filteredAndSortedProducts.map((product) => (
                    <tr
                      key={product.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleViewProfile(product.id)}
                          className="flex items-center gap-3 text-left w-full group/row"
                        >
                          <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                            {product.nombre.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-slate-900 dark:text-white group-hover/row:text-blue-600 dark:group-hover/row:text-blue-400 transition-colors truncate">
                              {product.nombre}
                            </p>
                            {product.codigoBarra && (
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                Código: {product.codigoBarra}
                              </p>
                            )}
                          </div>
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                          {product.categoria}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-700 dark:text-slate-300">
                        ${product.precioInicial.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-slate-700 dark:text-slate-300">
                        ${product.precioVenta.toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                          +${product.ganancia.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-medium ${
                              product.stockMinimo > 0 &&
                              product.cantidadInicial <= product.stockMinimo
                                ? "text-red-600 dark:text-red-400"
                                : "text-slate-700 dark:text-slate-300"
                            }`}
                          >
                            {product.cantidadInicial}
                          </span>
                          {product.stockMinimo > 0 &&
                            product.cantidadInicial <= product.stockMinimo && (
                            <span className="text-xs text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 px-2 py-0.5 rounded">
                              Bajo
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleViewProfile(product.id)}
                            className="p-2 text-violet-600 hover:bg-violet-50 dark:text-violet-400 dark:hover:bg-violet-900/30 rounded-lg transition-colors"
                            title="Ver perfil"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(product.id)}
                            className="p-2 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(product.id, product.nombre)}
                            className="p-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Summary */}
        {products.length > 0 && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Total Productos
              </p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {products.length}
              </p>
            </div>
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Valor del Inventario
              </p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                $
                {products
                  .reduce(
                    (sum, p) => sum + p.precioInicial * p.cantidadInicial,
                    0
                  )
                  .toFixed(2)}
              </p>
            </div>
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Ganancia Potencial
              </p>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                $
                {products
                  .reduce(
                    (sum, p) => sum + p.ganancia * p.cantidadInicial,
                    0
                  )
                  .toFixed(2)}
              </p>
            </div>
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Stock Bajo
              </p>
              <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                {
                  products.filter(
                    (p) => p.stockMinimo > 0 && p.cantidadInicial <= p.stockMinimo
                  ).length
                }
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
