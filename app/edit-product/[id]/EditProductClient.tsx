"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Package,
  Save,
  X,
  Barcode,
  Tag,
  DollarSign,
  Boxes,
  Plus,
  Check,
  AlertCircle,
} from "lucide-react";
import { useProducts } from "../../components/ProductContext";
import Toast from "../../components/Toast";

export default function EditProductClient() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;
  const { products, updateProduct, categories, addCategory, isBarcodeUnique } =
    useProducts();

  const [isLoading, setIsLoading] = useState(false);
  const [autoCalculate, setAutoCalculate] = useState(true);
  const [isLoadingProduct, setIsLoadingProduct] = useState(true);

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

  // Estado para nueva categoría
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [newCategory, setNewCategory] = useState("");

  // Estado para error de código de barra
  const [barcodeError, setBarcodeError] = useState("");

  const [formData, setFormData] = useState({
    nombre: "",
    categoria: "",
    precioInicial: "",
    precioVenta: "",
    codigoBarra: "",
    cantidadInicial: "",
    stockMinimo: "",
    stockMaximo: "",
    ganancia: "",
  });

  // Cargar datos del producto
  useEffect(() => {
    const product = products.find((p) => p.id === productId);
    if (product) {
      setFormData({
        nombre: product.nombre,
        categoria: product.categoria,
        precioInicial: product.precioInicial.toString(),
        precioVenta: product.precioVenta.toString(),
        codigoBarra: product.codigoBarra,
        cantidadInicial: product.cantidadInicial.toString(),
        stockMinimo: product.stockMinimo.toString(),
        stockMaximo: product.stockMaximo.toString(),
        ganancia: product.ganancia.toString(),
      });
      setIsLoadingProduct(false);
    } else if (products.length > 0) {
      // Producto no encontrado y la lista ya cargó
      setToast({
        show: true,
        message: "Producto no encontrado",
        type: "error",
      });
      setTimeout(() => router.push("/inventory"), 2000);
    }
  }, [productId, products, router]);

  // Auto-calculate ganancia
  const handlePrecioChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "precioInicial" | "precioVenta",
  ) => {
    const value = e.target.value;
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      if (autoCalculate) {
        const inicial = parseFloat(
          field === "precioInicial" ? value : prev.precioInicial,
        );
        const venta = parseFloat(
          field === "precioVenta" ? value : prev.precioVenta,
        );
        if (!isNaN(inicial) && !isNaN(venta)) {
          updated.ganancia = (venta - inicial).toFixed(2);
        }
      }
      return updated;
    });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    // Validar código de barra único (excluyendo el producto actual)
    if (name === "codigoBarra") {
      if (value.trim()) {
        if (!isBarcodeUnique(value, productId)) {
          setBarcodeError("Este código de barra ya está registrado");
        } else {
          setBarcodeError("");
        }
      } else {
        setBarcodeError("");
      }
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddNewCategory = () => {
    if (newCategory.trim()) {
      addCategory(newCategory.trim());
      setFormData((prev) => ({
        ...prev,
        categoria: newCategory.trim(),
      }));
      setNewCategory("");
      setShowNewCategoryInput(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar código de barra único antes de guardar
    if (
      formData.codigoBarra.trim() &&
      !isBarcodeUnique(formData.codigoBarra, productId)
    ) {
      setToast({
        show: true,
        message: "Error: El código de barra ya existe",
        type: "error",
      });
      return;
    }

    setIsLoading(true);

    try {
      updateProduct(productId, {
        nombre: formData.nombre,
        categoria: formData.categoria,
        precioInicial: parseFloat(formData.precioInicial) || 0,
        precioVenta: parseFloat(formData.precioVenta) || 0,
        codigoBarra: formData.codigoBarra,
        cantidadInicial: parseInt(formData.cantidadInicial) || 0,
        stockMinimo: parseInt(formData.stockMinimo) || 0,
        stockMaximo: parseInt(formData.stockMaximo) || 0,
        ganancia: parseFloat(formData.ganancia) || 0,
      });

      setToast({
        show: true,
        message: `Producto "${formData.nombre}" actualizado exitosamente`,
        type: "success",
      });

      // Redirigir después de 1.5 segundos
      setTimeout(() => {
        router.push("/inventory");
      }, 1500);
    } catch (error) {
      setToast({
        show: true,
        message: "Error al actualizar el producto",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push("/inventory");
  };

  const product = products.find((p) => p.id === productId);

  if (isLoadingProduct) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">
            Cargando producto...
          </p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Producto no encontrado
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            El producto que intentas editar no existe.
          </p>
          <button
            onClick={() => router.push("/inventory")}
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver al inventario
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Toast Notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.show}
        onClose={() => setToast({ ...toast, show: false })}
      />

      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow-sm border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={handleCancel}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </button>
            <div className="flex items-center gap-3">
              <div className="bg-blue-500 p-2 rounded-lg">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Editar Producto
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  ID: {productId}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information Card */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-blue-500 to-cyan-600 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-white" />
                <h2 className="text-lg font-semibold text-white">
                  Información Básica
                </h2>
              </div>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nombre */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Nombre <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                  placeholder="Ej: Cocacola 3L"
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>

              {/* Categoría */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Categoría <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <select
                    name="categoria"
                    value={formData.categoria}
                    onChange={handleChange}
                    required
                    className="flex-1 px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option disabled value="">
                      Seleccionar categoría
                    </option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() =>
                      setShowNewCategoryInput(!showNewCategoryInput)
                    }
                    className="px-3 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center gap-1"
                    title="Agregar nueva categoría"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>

                {/* Input para nueva categoría */}
                {showNewCategoryInput && (
                  <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600 animate-in fade-in slide-in-from-top-2">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Nueva Categoría
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        placeholder="Ej: Tecnología"
                        className="flex-1 px-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={handleAddNewCategory}
                        disabled={!newCategory.trim()}
                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-1"
                      >
                        <Check className="w-4 h-4" />
                        Agregar
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Código de Barra */}
              <div className="space-y-2 md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Código de Barra
                </label>
                <div className="relative">
                  <Barcode className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    name="codigoBarra"
                    value={formData.codigoBarra}
                    onChange={handleChange}
                    placeholder="Ej: 7501234567890"
                    className={`w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-700 border rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 transition-colors ${
                      barcodeError
                        ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                        : "border-slate-300 dark:border-slate-600 focus:ring-blue-500 focus:border-blue-500"
                    }`}
                  />
                </div>
                {barcodeError && (
                  <div className="flex items-center gap-1 text-red-500 text-sm animate-in fade-in slide-in-from-top-1">
                    <AlertCircle className="w-4 h-4" />
                    <span>{barcodeError}</span>
                  </div>
                )}
                {!barcodeError && (
                  <p className="text-xs text-slate-500">
                    Si ingresas un código, debe ser único en el sistema
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Pricing Card */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-white" />
                <h2 className="text-lg font-semibold text-white">
                  Precios y Ganancia
                </h2>
              </div>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Precio Inicial */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Precio Inicial <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    $
                  </span>
                  <input
                    type="number"
                    name="precioInicial"
                    value={formData.precioInicial}
                    onChange={(e) => handlePrecioChange(e, "precioInicial")}
                    required
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    className="w-full pl-8 pr-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              {/* Precio de Venta */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Precio de Venta <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    $
                  </span>
                  <input
                    type="number"
                    name="precioVenta"
                    value={formData.precioVenta}
                    onChange={(e) => handlePrecioChange(e, "precioVenta")}
                    required
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    className="w-full pl-8 pr-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              {/* Ganancia */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Ganancia por Unidad
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    $
                  </span>
                  <input
                    disabled
                    type="number"
                    name="ganancia"
                    value={formData.ganancia}
                    step="0.01"
                    placeholder="0.00"
                    className={`w-full pl-8 pr-4 py-2.5 border rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors ${
                      autoCalculate
                        ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-300 dark:border-emerald-600"
                        : "bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600"
                    }`}
                  />
                </div>
                <p className="text-xs text-slate-500">
                  {autoCalculate
                    ? "Calculado automáticamente"
                    : "Editado manualmente"}
                </p>
              </div>
            </div>
          </div>

          {/* Stock Card */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-amber-500 to-orange-600 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <Boxes className="w-5 h-5 text-white" />
                <h2 className="text-lg font-semibold text-white">
                  Gestión de Inventario
                </h2>
              </div>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Cantidad Inicial */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Cantidad <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="cantidadInicial"
                  value={formData.cantidadInicial}
                  onChange={handleChange}
                  required
                  min="0"
                  placeholder="0"
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                />
              </div>

              {/* Stock Mínimo */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Stock Mínimo
                </label>
                <input
                  type="number"
                  name="stockMinimo"
                  value={formData.stockMinimo}
                  onChange={handleChange}
                  min="0"
                  placeholder="0"
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                />
                <p className="text-xs text-slate-500">
                  Alerta cuando el stock esté por debajo de este número
                </p>
              </div>

              {/* Stock Máximo */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Stock Máximo
                </label>
                <input
                  type="number"
                  name="stockMaximo"
                  value={formData.stockMaximo}
                  onChange={handleChange}
                  min="0"
                  placeholder="0"
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-end pt-4">
            <button
              type="button"
              onClick={handleCancel}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium rounded-xl border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
            >
              <X className="w-5 h-5" />
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading || !!barcodeError}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-medium rounded-xl hover:from-blue-600 hover:to-cyan-700 focus:ring-4 focus:ring-blue-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-5 h-5" />
              {isLoading ? "Guardando..." : "Guardar Cambios"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
