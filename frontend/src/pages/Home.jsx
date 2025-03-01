import { useEffect, useState } from 'react';
import { getLastMovements } from '../services/api';
import { useAuth } from '../hooks/useAuth';

export default function Home({ refresh }) {
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { token } = useAuth();

  const fetchMovements = async (pageNum) => {
    if (!token) {
      setError('No hay token de autenticación');
      setLoading(false);
      return;
    }

    try {
      const data = await getLastMovements(token, pageNum);
      
      // Si no hay más datos o son menos de 10, no hay más páginas
      if (!data.length || data.length < 10) {
        setHasMore(false);
      }

      // Asegurarse de que cada movimiento tiene un ID único
      const validData = data.filter(movement => movement && movement.id);

      if (pageNum === 1) {
        setMovements(validData);
      } else {
        // Evitar duplicados al concatenar nuevos movimientos
        setMovements(prev => {
          const existingIds = new Set(prev.map(m => m.id));
          const newMovements = validData.filter(m => !existingIds.has(m.id));
          return [...prev, ...newMovements];
        });
      }
      
      setError(null);
    } catch (err) {
      console.error('Error al cargar movimientos:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchMovements(1);
  }, [token, refresh]);

  const loadMore = () => {
    setLoading(true);
    const nextPage = page + 1;
    setPage(nextPage);
    fetchMovements(nextPage);
  };

  const formatDate = (date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const movementDate = new Date(date);

    // Comparar solo las fechas sin la hora
    const isToday = movementDate.toDateString() === today.toDateString();
    const isYesterday = movementDate.toDateString() === yesterday.toDateString();

    if (isToday) {
      return 'Hoy';
    } else if (isYesterday) {
      return 'Ayer';
    } else {
      return movementDate.toLocaleDateString();
    }
  };

  if (error) {
    return (
      <div className="text-center py-4">
        <p className="text-red-500">Error: {error}</p>
        <button 
          onClick={() => {
            setLoading(true);
            setError(null);
            fetchMovements(1);
          }}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-dark-surface rounded-xl p-6 shadow-lg w-full">
        <h2 className="text-2xl font-bold mb-6 text-dark-primary">Últimos Movimientos</h2>
        
        <div className="space-y-4 w-full">
          {movements.length === 0 ? (
            <p className="text-center text-dark-on-surface/60">No hay movimientos registrados</p>
          ) : (
            <div className="flex flex-col">
              {movements.map(movement => {
                const amount = typeof movement.cantidad === 'number' ? movement.cantidad : parseFloat(movement.cantidad || 0);
                const balance = typeof movement.balance_posterior === 'number' ? movement.balance_posterior : parseFloat(movement.balance_posterior || 0);
                
                const uniqueKey = `${movement.id}-${movement.tipo_movimiento}-${movement.fecha}`;

                // Función para determinar el texto del balance
                const getBalanceText = () => {
                  // Solo mostrar "Banco:" si es un depósito al banco
                  if (movement.tipo_movimiento === 'deposito' && movement.tipo_deposito === 'banco') {
                    return 'Banco:';
                  }
                  // Para todo lo demás (gastos, transferencias y depósitos al cajón)
                  return 'Cajón:';
                };

                return (
                  <div
                    key={uniqueKey}
                    className="w-full bg-dark-surface-variant/50 p-4 rounded-lg hover:bg-dark-surface-variant/70 transition-colors [box-shadow:0_1px_0_rgba(255,255,255,0.05)]"
                  >
                    <div className="flex justify-between mb-2">
                      <div className="text-left">
                        <p className="text-dark-on-surface font-medium">
                          {movement.descripcion}
                        </p>
                        {movement.tipo_movimiento === 'transferencia' && (
                          <p className="text-[10px] text-gray-500">
                            {movement.tipo === 'banco_a_cajon' ? 'Banco → Cajón' : 'Cajón → Banco'}
                          </p>
                        )}
                      </div>
                      <p className={`text-lg font-bold ${
                        movement.tipo_movimiento === 'deposito' ? 'text-green-500' : 
                        movement.tipo_movimiento === 'gasto' ? 'text-red-500' : 
                        'text-blue-500'
                      }`}>
                        {amount.toFixed(2)} €
                      </p>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm text-dark-on-surface/60">
                        {formatDate(movement.fecha)}
                      </span>
                      <span className="text-sm text-dark-on-surface/60 ml-auto pl-4">
                        {getBalanceText()} {balance.toFixed(2)} €
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          
          {hasMore && (
            <div className="mt-4">
              <button
                onClick={loadMore}
                disabled={loading}
                className="w-full px-6 py-2 bg-dark-primary text-dark-on-primary rounded-lg font-medium 
                         hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Cargando...' : 'Ver más movimientos'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}