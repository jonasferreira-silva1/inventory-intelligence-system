import { useEffect, useState } from 'react';
import { dashboardApi, DashboardStats } from '../api/dashboard';
import {
  Package,
  FolderTree,
  DollarSign,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  BarChart3
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { formatCurrency } from '../utils/format';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await dashboardApi.getStats();
      setStats(data);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Carregando...</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">Erro ao carregar dados</div>
      </div>
    );
  }

  const categoryChartData = stats.categoryStats.map(cat => ({
    name: cat.categoryName,
    value: cat.totalValue,
    products: cat.productCount
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Visão geral do seu estoque</p>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total de Produtos</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalProducts}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Valor do Estoque</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatCurrency(stats.totalStockValue)}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Estoque Crítico</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{stats.lowStockCount}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Produtos Parados</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">
                {stats.stagnantProductsCount}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <TrendingDown className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Categorias */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Valor por Categoria
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Legend />
              <Bar dataKey="value" fill="#3b82f6" name="Valor Total" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico de Pizza - Distribuição */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Distribuição de Produtos
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="products"
              >
                {categoryChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Produtos Destaque */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Mais Vendido */}
        {stats.mostSoldProduct && (
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">Mais Vendido</h3>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.mostSoldProduct.name}</p>
            <p className="text-sm text-gray-600 mt-1">
              {stats.mostSoldProduct.totalSold} unidades vendidas
            </p>
          </div>
        )}

        {/* Mais Lucrativo */}
        {stats.mostProfitableProduct && (
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Mais Lucrativo</h3>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {stats.mostProfitableProduct.name}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Margem: {stats.mostProfitableProduct.profitMargin.toFixed(2)}%
            </p>
            <p className="text-sm text-green-600 font-medium mt-1">
              Lucro: {formatCurrency(stats.mostProfitableProduct.totalProfit)}
            </p>
          </div>
        )}

        {/* Menos Vendido */}
        {stats.leastSoldProduct && (
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <TrendingDown className="h-5 w-5 text-red-600" />
              <h3 className="text-lg font-semibold text-gray-900">Menos Vendido</h3>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.leastSoldProduct.name}</p>
            <p className="text-sm text-gray-600 mt-1">
              {stats.leastSoldProduct.totalSold} unidades vendidas
            </p>
          </div>
        )}
      </div>

      {/* Movimentações */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Movimentações</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Total de Movimentações</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalMovements}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Últimos 30 Dias</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {stats.movementsLast30Days}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

