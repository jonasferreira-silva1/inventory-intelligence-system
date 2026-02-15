import { useEffect, useState } from 'react';
import { alertsApi, Alert } from '../api/alerts';
import { Bell, Check, CheckCheck, RefreshCw, AlertTriangle, TrendingDown, DollarSign } from 'lucide-react';
import { formatDate } from '../utils/format';

export default function Alerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('unread');

  useEffect(() => {
    loadAlerts();
  }, [filter]);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      const data = await alertsApi.getAll({
        isRead: filter === 'unread' ? false : undefined,
      });
      setAlerts(data);
    } catch (error) {
      console.error('Erro ao carregar alertas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await alertsApi.markAsRead(id);
      loadAlerts();
    } catch (error) {
      console.error('Erro ao marcar alerta como lido:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await alertsApi.markAllAsRead();
      loadAlerts();
    } catch (error) {
      console.error('Erro ao marcar todos como lidos:', error);
    }
  };

  const handleCheckAlerts = async () => {
    try {
      await alertsApi.check();
      loadAlerts();
      alert('Verificação de alertas concluída!');
    } catch (error) {
      console.error('Erro ao verificar alertas:', error);
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'LOW_STOCK':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case 'NO_MOVEMENT':
        return <TrendingDown className="h-5 w-5 text-yellow-600" />;
      case 'PROFIT_OPPORTUNITY':
        return <DollarSign className="h-5 w-5 text-green-600" />;
      default:
        return <Bell className="h-5 w-5 text-blue-600" />;
    }
  };

  const getAlertBadge = (type: string) => {
    switch (type) {
      case 'LOW_STOCK':
        return <span className="badge badge-danger">Estoque Baixo</span>;
      case 'NO_MOVEMENT':
        return <span className="badge badge-warning">Produto Parado</span>;
      case 'PROFIT_OPPORTUNITY':
        return <span className="badge badge-success">Oportunidade</span>;
      default:
        return <span className="badge badge-info">Alerta</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Alertas</h1>
          <p className="text-gray-600 mt-1">Notificações e avisos do sistema</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleCheckAlerts}
            className="btn btn-secondary flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Verificar Alertas
          </button>
          {filter === 'unread' && alerts.length > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="btn btn-primary flex items-center gap-2"
            >
              <CheckCheck className="h-4 w-4" />
              Marcar Todos como Lidos
            </button>
          )}
        </div>
      </div>

      {/* Filtros */}
      <div className="card">
        <div className="flex gap-4">
          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'unread'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Não Lidos
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'all'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Todos
          </button>
        </div>
      </div>

      {loading ? (
        <div className="card text-center py-12">
          <div className="text-gray-500">Carregando...</div>
        </div>
      ) : alerts.length === 0 ? (
        <div className="card text-center py-12">
          <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <div className="text-gray-500">Nenhum alerta encontrado</div>
        </div>
      ) : (
        <div className="space-y-4">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`card ${!alert.isRead ? 'border-l-4 border-l-primary-600' : ''}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="mt-1">{getAlertIcon(alert.type)}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getAlertBadge(alert.type)}
                      {alert.product && (
                        <span className="text-sm font-medium text-gray-900">
                          {alert.product.name}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-700 mb-2">{alert.message}</p>
                    <p className="text-xs text-gray-500">
                      {formatDate(alert.createdAt)}
                    </p>
                  </div>
                </div>
                {!alert.isRead && (
                  <button
                    onClick={() => handleMarkAsRead(alert.id)}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                    title="Marcar como lido"
                  >
                    <Check className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

