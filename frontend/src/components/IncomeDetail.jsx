import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getIncomeDetails } from '../services/api';

export default function IncomeDetail({ date, onBack, isSeasonView }) {
  const { token } = useAuth();
  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  const loadIncomes = async () => {
    setLoading(true);
    try {
      const response = await getIncomeDetails(token, date, isSeasonView, currentPage);

      // Si la respuesta es un array directo (sin paginación)
      if (Array.isArray(response)) {
        setIncomes(response);
        setHasMore(false);
        setTotalPages(1);
      } 
      // Si la respuesta tiene estructura de paginación
      else if (response.data) {
        setIncomes(prevIncomes => {
          return currentPage === 1 
            ? response.data 
            : [...prevIncomes, ...response.data];
        });
        setTotalPages(Math.ceil(response.total / response.per_page));
        setHasMore(currentPage < Math.ceil(response.total / response.per_page));
      }
      
      setError(null);
    } catch (error) {
      console.error('Error:', error);
      setError('Error al cargar los ingresos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIncomes();
  }, [date, currentPage, isSeasonView]);

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
      <div className="flex items-center mb-4 gap-2">
        <button 
          onClick={onBack}
          className="text-dark-text hover:text-dark-primary transition-colors text-xl font-bold px-2"
        >
          ←
        </button>
        <h2 className="text-xl sm:text-2xl font-bold text-dark-text">
          Ingresos a Cartera
        </h2>
      </div>
      
      <div className="bg-dark-bg rounded-lg shadow p-3 sm:p-6">
        {loading && currentPage === 1 ? (
          <div className="text-center py-4">Cargando...</div>
        ) : error ? (
          <div className="text-center text-dark-error py-4">{error}</div>
        ) : (
          <>
            <div className="space-y-2">
              {incomes && incomes.length > 0 ? (
                incomes.map((income) => (
                  <div key={income.id} className="bg-dark-surface rounded-lg p-2 sm:p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-dark-text text-sm sm:text-base">{income.descripcion}</p>
                        <p className="text-dark-text-secondary text-xs">
                          {new Date(income.fecha).toLocaleDateString()}
                        </p>
                      </div>
                      <p className="text-green-500 text-sm sm:text-base font-semibold">
                        +{parseFloat(income.cantidad).toFixed(2)} €
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-dark-text-secondary py-4">
                  No hay ingresos para mostrar
                </div>
              )}
            </div>
            
            {hasMore && !loading && (
              <button
                onClick={() => setCurrentPage(p => p + 1)}
                className="mt-4 w-full py-2 text-dark-text text-sm bg-dark-surface hover:bg-dark-surface-hover rounded-lg transition-colors"
              >
                Cargar más
              </button>
            )}
            
            {loading && currentPage > 1 && (
              <div className="text-center py-4">Cargando más...</div>
            )}
          </>
        )}
      </div>
    </div>
  );
} 