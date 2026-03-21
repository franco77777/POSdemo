export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-gray-900 text-white">
        <div className="p-6">
          <h1 className="text-xl font-bold">Admin Panel</h1>
        </div>
        <nav className="px-4 space-y-2">
          <a href="#" className="block px-4 py-2 rounded bg-blue-600 text-white">
            Dashboard
          </a>
          <a href="#" className="block px-4 py-2 rounded hover:bg-gray-800 transition">
            Usuarios
          </a>
          <a href="#" className="block px-4 py-2 rounded hover:bg-gray-800 transition">
            Productos
          </a>
          <a href="#" className="block px-4 py-2 rounded hover:bg-gray-800 transition">
            Ventas
          </a>
          <a href="#" className="block px-4 py-2 rounded hover:bg-gray-800 transition">
            Configuración
          </a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="ml-64 p-8">
        <header className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800">Dashboard</h2>
          <p className="text-gray-500">Bienvenido al panel de administración</p>
        </header>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Ventas Totales</h3>
            <p className="text-2xl font-bold text-gray-800">$24,500</p>
            <span className="text-green-600 text-sm">+12% vs mes anterior</span>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Pedidos</h3>
            <p className="text-2xl font-bold text-gray-800">1,250</p>
            <span className="text-green-600 text-sm">+5% vs mes anterior</span>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Clientes</h3>
            <p className="text-2xl font-bold text-gray-800">850</p>
            <span className="text-red-600 text-sm">-2% vs mes anterior</span>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Productos</h3>
            <p className="text-2xl font-bold text-gray-800">320</p>
            <span className="text-green-600 text-sm">+8 nuevos</span>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold text-gray-800">Actividad Reciente</h3>
          </div>
          <div className="p-6">
            <table className="w-full">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="pb-3">ID</th>
                  <th className="pb-3">Cliente</th>
                  <th className="pb-3">Producto</th>
                  <th className="pb-3">Monto</th>
                  <th className="pb-3">Estado</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                <tr className="border-b">
                  <td className="py-3">#001</td>
                  <td className="py-3">Juan Pérez</td>
                  <td className="py-3">Laptop HP</td>
                  <td className="py-3">$800</td>
                  <td className="py-3"><span className="px-2 py-1 bg-green-100 text-green-800 rounded">Completado</span></td>
                </tr>
                <tr className="border-b">
                  <td className="py-3">#002</td>
                  <td className="py-3">María García</td>
                  <td className="py-3">Mouse Logitech</td>
                  <td className="py-3">$25</td>
                  <td className="py-3"><span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded">Pendiente</span></td>
                </tr>
                <tr className="border-b">
                  <td className="py-3">#003</td>
                  <td className="py-3">Carlos López</td>
                  <td className="py-3">Teclado Mecánico</td>
                  <td className="py-3">$120</td>
                  <td className="py-3"><span className="px-2 py-1 bg-green-100 text-green-800 rounded">Completado</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
