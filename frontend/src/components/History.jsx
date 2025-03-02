import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getMonthlyExpensesSummary, getSeasonExpensesSummary, resetSeason } from '../services/api';
import ExpenseTypeDetail from './ExpenseTypeDetail';
import { motion, AnimatePresence } from 'framer-motion';
import IncomeDetail from './IncomeDetail';

export default function History({ refresh }) {
  const { token } = useAuth();
  const [monthlySummary, setMonthlySummary] = useState([]);
  const [seasonSummary, setSeasonSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalMonthly, setTotalMonthly] = useState(0);
  const [totalSeason, setTotalSeason] = useState(0);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 7)); // Formato YYYY-MM
  const [selectedType, setSelectedType] = useState(null);
  const [seasonStartDate, setSeasonStartDate] = useState(null);
  const [isSeasonView, setIsSeasonView] = useState(false);
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [seasonIncome, setSeasonIncome] = useState(0);
  const [refreshHistory, setRefreshHistory] = useState(0);
  const [selectedIncome, setSelectedIncome] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  // Generar array de últimos 12 meses
  const getLast12Months = () => {
    const months = [];
    const monthNames = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    
    for (let i = 0; i < 12; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const month = date.getMonth();
      const year = date.getFullYear();
      months.push({
        label: `${monthNames[month]} ${year}`,
        value: `${year}-${String(month + 1).padStart(2, '0')}`
      });
    }
    return months;
  };

  const loadMonthlySummary = async () => {
    try {
      const data = await getMonthlyExpensesSummary(token, selectedDate);
      const validGastos = data.gastos.filter(gasto => gasto && gasto.expense_type_id);
      setMonthlySummary([
        ...validGastos,
        {
          expense_type_id: 'ingresos-monthly',
          tipo_nombre: 'Ingresos',
          total: data.ingresos || 0
        }
      ]);
      const totalGastos = validGastos.reduce((acc, item) => acc + parseFloat(item.total), 0);
      setTotalMonthly((data.ingresos || 0) - totalGastos);
      setMonthlyIncome(data.ingresos || 0);
    } catch (error) {
      console.error('Error loading monthly summary:', error);
    }
  };

  const loadSeasonSummary = async () => {
    try {
      const data = await getSeasonExpensesSummary(token);
      const validSummary = data.summary.filter(item => item && item.expense_type_id);
      setSeasonSummary([
        ...validSummary,
        {
          expense_type_id: 'ingresos-season',
          tipo_nombre: 'Ingresos',
          total: data.ingresos || 0
        }
      ]);
      const totalGastos = validSummary.reduce((acc, item) => acc + parseFloat(item.total), 0);
      setTotalSeason((data.ingresos || 0) - totalGastos);
      setSeasonStartDate(new Date(data.seasonStart).toLocaleDateString());
      setSeasonIncome(data.ingresos || 0);
    } catch (error) {
      console.error('Error loading season summary:', error);
    }
  };

  const handleResetSeason = async () => {
    setShowResetModal(true);
  };

  const confirmReset = async () => {
    try {
      await resetSeason(token);
      await loadSeasonSummary();
      setShowResetModal(false);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // Función para cargar los datos
  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([loadMonthlySummary(), loadSeasonSummary()]);
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  // useEffect para el refresh y selectedDate
  useEffect(() => {
    loadData();
  }, [refresh, selectedDate, token]); // Añadimos todas las dependencias necesarias

  const handleTypeClick = (typeId, typeName, isSeason = false) => {
    if (typeId === 'ingresos-monthly' || typeId === 'ingresos-season') {
      setSelectedIncome(true);
      setIsSeasonView(isSeason);
    } else {
      setSelectedType({ id: typeId, name: typeName });
      setIsSeasonView(isSeason);
    }
  };

  const handleBack = () => {
    setSelectedType(null);
    setSelectedIncome(false);
  };

  const handleGastoSubmit = async () => {
    // ... lógica del gasto ...
    setRefreshHistory(prev => prev + 1);
  };

  const handleIngresoSubmit = async () => {
    // ... lógica del ingreso ...
    setRefreshHistory(prev => prev + 1);
  };

  if (loading) {
    return <div className="text-center py-4">Cargando...</div>;
  }
  if (error) return <div className="text-center text-dark-error py-4">{error}</div>;

  return (
    <div className="overflow-x-hidden">
      {selectedType ? (
        <ExpenseTypeDetail 
          key={`expense-type-${selectedType.id || 'default'}-${isSeasonView ? 'season' : 'monthly'}-${selectedDate}`}
          typeId={selectedType.id} 
          typeName={selectedType.name}
          date={selectedDate}
          onBack={handleBack}
          isSeasonView={isSeasonView}
        />
      ) : selectedIncome ? (
        <IncomeDetail 
          key={`income-${isSeasonView ? 'season' : 'monthly'}-${selectedDate}`}
          date={selectedDate}
          onBack={handleBack}
          isSeasonView={isSeasonView}
        />
      ) : (
        <div key="summary-view" className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl sm:text-2xl font-bold text-dark-primary">Historial de Gastos</h2>
            <select
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-dark-surface text-dark-text rounded-lg px-3 py-2 text-sm sm:text-base border border-dark-border focus:outline-none focus:border-dark-primary"
            >
              {getLast12Months().map((month) => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>
          </div>
          <div className="bg-dark-bg rounded-lg shadow p-3 sm:p-6 mb-6">
            <h3 className="text-lg sm:text-xl font-semibold mb-4 text-dark-primary">Resumen del Mes</h3>
            <div className="mb-4">
              <p className="text-base sm:text-lg text-dark-text">
                Balance: <span className={`font-semibold ${totalMonthly < 0 ? 'text-red-500' : 'text-green-500'}`}>
                  {totalMonthly < 0 ? '-' : '+'}{Math.abs(totalMonthly).toFixed(2)} €
                </span>
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2 sm:gap-4">
              {monthlySummary
                .filter(item => item && item.expense_type_id && item.tipo_nombre)
                .map((item) => (
                  <div
                    key={`monthly-${item.expense_type_id}-${item.tipo_nombre}`}
                    className="bg-dark-surface rounded-lg p-2 sm:p-4 cursor-pointer hover:bg-dark-surface-hover transition-colors"
                    onClick={() => handleTypeClick(item.expense_type_id, item.tipo_nombre, false)}
                  >
                    <h4 className="font-semibold text-dark-text text-sm sm:text-base">
                      {item.tipo_nombre || 'Sin nombre'}
                    </h4>
                    <p className={`text-xs sm:text-base ${item.expense_type_id === 'ingresos-monthly' ? 'text-green-500' : 'text-red-500'}`}>
                      {item.expense_type_id === 'ingresos-monthly' ? '+' : '-'}{parseFloat(item.total || 0).toFixed(2)} €
                    </p>
                  </div>
                ))}
            </div>
          </div>

          <div className="bg-dark-bg rounded-lg shadow p-3 sm:p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg sm:text-xl font-semibold text-dark-primary">Resumen de Temporada</h3>
              <button
                onClick={handleResetSeason}
                className="px-4 py-2 bg-dark-primary hover:bg-dark-surface-hover active:scale-95 
                           active:bg-dark-primary/70 text-black font-semibold rounded-lg 
                           transition-all transform text-sm"
              >
                Reiniciar Temporada
              </button>
            </div>
            <p className="text-sm text-dark-text-secondary mb-2">
              Desde: {seasonStartDate}
            </p>
            <div className="mb-4">
              <p className="text-base sm:text-lg text-dark-text">
                Balance: <span className={`font-semibold ${totalSeason < 0 ? 'text-red-500' : 'text-green-500'}`}>
                  {totalSeason < 0 ? '-' : '+'}{Math.abs(totalSeason).toFixed(2)} €
                </span>
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2 sm:gap-4">
              {seasonSummary
                .filter(item => item && item.expense_type_id && item.tipo_nombre)
                .map((item) => (
                  <div
                    key={`season-${item.expense_type_id}-${item.tipo_nombre}`}
                    className="bg-dark-surface rounded-lg p-2 sm:p-4 cursor-pointer hover:bg-dark-surface-hover transition-colors"
                    onClick={() => handleTypeClick(item.expense_type_id, item.tipo_nombre, true)}
                  >
                    <h4 className="font-semibold text-dark-text text-sm sm:text-base">
                      {item.tipo_nombre || 'Sin nombre'}
                    </h4>
                    <p className={`text-xs sm:text-base ${item.expense_type_id === 'ingresos-season' ? 'text-green-500' : 'text-red-500'}`}>
                      {item.expense_type_id === 'ingresos-season' ? '+' : '-'}{parseFloat(item.total || 0).toFixed(2)} €
                    </p>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {showResetModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-dark-bg rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold text-dark-primary mb-4">
              Confirmar Reinicio
            </h3>
            <p className="text-dark-text mb-6">
              ¿Estás seguro de que quieres reiniciar la temporada? Esto establecerá un nuevo punto de inicio para el resumen de temporada.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowResetModal(false)}
                className="px-4 py-2 bg-dark-surface hover:bg-dark-surface-hover active:scale-95 
                           active:bg-dark-surface-hover text-dark-text rounded-lg 
                           transition-all transform"
              >
                Cancelar
              </button>
              <button
                onClick={confirmReset}
                className="px-4 py-2 bg-dark-primary hover:bg-dark-primary/80 active:scale-95 
                           active:bg-dark-primary/70 text-black font-semibold rounded-lg 
                           transition-all transform"
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 