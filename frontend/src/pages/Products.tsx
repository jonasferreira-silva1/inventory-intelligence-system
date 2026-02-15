import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { productsApi, Product } from '../api/products';
import { categoriesApi } from '../api/categories';
import { Plus, Search, Edit, Trash2, AlertTriangle, TrendingDown } from 'lucide-react';
import { formatCurrency } from '../utils/format';

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [lowStockFilter, setLowStockFilter] = useState(false);
  const [stagnantFilter, setStagnantFilter] = useState(false);

  useEffect(() => {
    loadData();
  }, [categoryFilter, lowStockFilter, stagnantFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [productsData, categoriesData] = await Promise.all([
        productsApi.getAll({
          search: search || undefined,
          categoryId: categoryFilter || undefined,
          lowStock: lowStockFilter || undefined,
          stagnant: stagnantFilter || undefined,
        }),
        categoriesApi.getAll(),
      ]);
      setProducts(productsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return;
    try {
      await productsApi.delete(id);
      loadData();
    } catch (error) {
      console.error('Erro ao excluir produto:', error);
      alert('Erro ao excluir produto');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Produtos</h1>
          <p className="text-gray-600 mt-1">Gerencie seu estoque de produtos</p>
        </div>
        <Link to="/products/new" className="btn btn-primary flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Novo Produto
        </Link>
      </div>

      {/* Filtros */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar produtos..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && loadData()}
                className="input pl-10"
              />
            </div>
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="input"
          >
            <option value="">Todas as categorias</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          <div className="flex gap-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={lowStockFilter}
                onChange={(e) => setLowStockFilter(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm text-gray-700">Estoque baixo</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={stagnantFilter}
                onChange={(e) => setStagnantFilter(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm text-gray-700">Parados</span>
            </label>
          </div>
        </div>
      </div>

      {/* Tabela */}
      {loading ? (
        <div className="card text-center py-12">
          <div className="text-gray-500">Carregando...</div>
        </div>
      ) : products.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-gray-500">Nenhum produto encontrado</div>
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Nome</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Código</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Categoria</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Quantidade</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Preço Venda</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Margem</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Ações</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="font-medium text-gray-900">{product.name}</div>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{product.code}</td>
                  <td className="py-3 px-4 text-gray-600">
                    {product.category?.name || '-'}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className={product.quantity <= product.minQuantity ? 'text-red-600 font-semibold' : ''}>
                        {product.quantity}
                      </span>
                      {product.quantity <= product.minQuantity && (
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-900">
                    {formatCurrency(product.salePrice)}
                  </td>
                  <td className="py-3 px-4">
                    {product.metrics ? (
                      <span className={product.metrics.profitMargin > 50 ? 'text-green-600 font-semibold' : 'text-gray-600'}>
                        {product.metrics.profitMargin.toFixed(1)}%
                      </span>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-col gap-1">
                      {product.quantity <= product.minQuantity && (
                        <span className="badge badge-danger">Estoque baixo</span>
                      )}
                      {product.metrics?.isStagnant && (
                        <span className="badge badge-warning flex items-center gap-1">
                          <TrendingDown className="h-3 w-3" />
                          Parado
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        to={`/products/edit/${product.id}`}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="h-4 w-4" />
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
  );
}

