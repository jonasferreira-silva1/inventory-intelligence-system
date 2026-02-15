import { useEffect, useState } from 'react';
import { movementsApi, Movement, CreateMovementData } from '../api/movements';
import { productsApi } from '../api/products';
import { Plus, ArrowDown, ArrowUp, Package } from 'lucide-react';
import { formatDate } from '../utils/format';

export default function Movements() {
  const [movements, setMovements] = useState<Movement[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<CreateMovementData>({
    productId: '',
    type: 'ENTRY',
    quantity: 1,
    reason: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [movementsData, productsData] = await Promise.all([
        movementsApi.getAll({ limit: 100 }),
        productsApi.getAll(),
      ]);
      setMovements(movementsData.movements);
      setProducts(productsData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await movementsApi.create(formData);
      setShowForm(false);
      setFormData({
        productId: '',
        type: 'ENTRY',
        quantity: 1,
        reason: '',
      });
      loadData();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Erro ao registrar movimentação');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Movimentações</h1>
          <p className="text-gray-600 mt-1">Histórico de entradas e saídas do estoque</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          Nova Movimentação
        </button>
      </div>

      {showForm && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Nova Movimentação</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Produto *
              </label>
              <select
                value={formData.productId}
                onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                className="input"
                required
              >
                <option value="">Selecione um produto</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} - Estoque: {product.quantity}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo *
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as 'ENTRY' | 'EXIT' })}
                className="input"
                required
              >
                <option value="ENTRY">Entrada</option>
                <option value="EXIT">Saída</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantidade *
              </label>
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                className="input"
                min="1"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Motivo
              </label>
              <input
                type="text"
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                className="input"
                placeholder="Ex: Compra, Venda, Ajuste..."
              />
            </div>
            <div className="flex gap-4">
              <button type="submit" className="btn btn-primary">
                Registrar
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setFormData({
                    productId: '',
                    type: 'ENTRY',
                    quantity: 1,
                    reason: '',
                  });
                }}
                className="btn btn-secondary"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="card text-center py-12">
          <div className="text-gray-500">Carregando...</div>
        </div>
      ) : movements.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-gray-500">Nenhuma movimentação registrada</div>
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Data</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Produto</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Tipo</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Quantidade</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Motivo</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Usuário</th>
              </tr>
            </thead>
            <tbody>
              {movements.map((movement) => (
                <tr key={movement.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-gray-600">
                    {formatDate(movement.createdAt)}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-gray-400" />
                      <span className="font-medium text-gray-900">
                        {movement.product?.name || '-'}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    {movement.type === 'ENTRY' ? (
                      <span className="badge badge-success flex items-center gap-1 w-fit">
                        <ArrowDown className="h-3 w-3" />
                        Entrada
                      </span>
                    ) : (
                      <span className="badge badge-danger flex items-center gap-1 w-fit">
                        <ArrowUp className="h-3 w-3" />
                        Saída
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 font-semibold text-gray-900">
                    {movement.quantity}
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    {movement.reason || '-'}
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    {movement.user?.name || '-'}
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

