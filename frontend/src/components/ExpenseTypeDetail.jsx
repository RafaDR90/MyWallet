import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getExpensesByType } from '../services/api';

export default function ExpenseTypeDetail({ typeId, typeName, date, onBack, isSeasonView }) {
  const { token } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    let ignore = false;

    const loadExpenses = async () => {
      try {
        const data = await getExpensesByType(token, typeId, date, isSeasonView, currentPage);
        
        if (!ignore) {
          setExpenses(prev => 
            currentPage === 1 ? data.data : [...prev, ...data.data]
          );
          setHasMore(currentPage < Math.ceil(data.total / data.per_page));
          setLoading(false);
        }
      } catch (error) {
        if (!ignore) {
          setError('Error al cargar los gastos');
          setLoading(false);
        }
      }
    };

    loadExpenses();

    return () => {
      ignore = true;
    };
  }, [token, typeId, date, isSeasonView, currentPage]);

  // Reset cuando cambian los filtros principales
  useEffect(() => {
    setCurrentPage(1);
    setExpenses([]);
    setLoading(true);
  }, [typeId, date, isSeasonView]);

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
        {loading && expenses.length === 0 ? (
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
                      <p className="text-dark-text-secondary text-xs">
                        {new Date(expense.fecha).toLocaleDateString()}
                      </p>
                    </div>
                    <p className="text-dark-text text-sm sm:text-base font-semibold">
                      -{parseFloat(expense.monto).toFixed(2)} €
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            {hasMore && !loading && (
              <button
                onClick={() => setCurrentPage(p => p + 1)}
                className="mt-4 w-full py-2 text-dark-text text-sm bg-dark-surface hover:bg-dark-surface-hover rounded-lg transition-colors"
              >
                Cargar más
              </button>
            )}
            
            {loading && expenses.length > 0 && (
              <div className="text-center py-4">Cargando más...</div>
            )}
          </>
        )}
      </div>
    </div>
  );
} 