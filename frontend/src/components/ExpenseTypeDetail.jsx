import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getExpensesByType } from '../services/api';

export default function ExpenseTypeDetail({ typeId, typeName, date, onBack, isSeasonView }) {
  const { token } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  const loadExpenses = async () => {
    setLoading(true);
    try {
      const data = await getExpensesByType(token, typeId, date, isSeasonView, currentPage);
      setExpenses(data.data);
      setTotalPages(Math.ceil(data.total / data.per_page));
      setHasMore(data.data.length === 10);
      setError(null);
    } catch (error) {
      console.error('Error:', error);
      setError('Error al cargar los gastos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExpenses();
  }, [typeId, date, currentPage, isSeasonView]);

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
      <div className="flex items-center mb-4 gap-2">
        <button 
          onClick={onBack}
          className="text-dark-text hover:text-dark-primary transition-colors text-xl font-bold px-2"
        >
          ←
        </button>
        <h2 className="text-xl sm:text-2xl font-bold text-dark-text">{typeName}</h2>
      </div>
      
      <div className="bg-dark-bg rounded-lg shadow p-3 sm:p-6">
        {loading && page === 1 ? (
          <div className="text-center py-4">Cargando...</div>
        ) : error ? (
          <div className="text-center text-dark-error py-4">{error}</div>
        ) : (
          <>
            <div className="space-y-2">
              {expenses.map((expense) => (
                <div key={expense.id} className="bg-dark-surface rounded-lg p-2 sm:p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-dark-text text-sm sm:text-base">{expense.descripcion}</p>
                      <p className="text-dark-text-secondary text-xs">{new Date(expense.fecha).toLocaleDateString()}</p>
                    </div>
                    <p className="text-dark-text text-sm sm:text-base font-semibold">
                      -{parseFloat(expense.monto).toFixed(2)} €
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            {hasMore && (
              <button
                onClick={() => setCurrentPage(p => p + 1)}
                className="mt-4 w-full py-2 text-dark-text text-sm bg-dark-surface hover:bg-dark-surface-hover rounded-lg transition-colors"
              >
                {loading ? 'Cargando...' : 'Cargar más'}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
} 