import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getExpenseTypes, createExpense, createExpenseType } from '../services/api';

export default function ExpenseForm({ onClose, onSuccess }) {
  const { token } = useAuth();
  const [expenseTypes, setExpenseTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [creatingType, setCreatingType] = useState(false);
  const [showNewTypeForm, setShowNewTypeForm] = useState(false);
  const [newTypeName, setNewTypeName] = useState('');
  const [formData, setFormData] = useState({
    expense_type_id: '',
    monto: '',
    descripcion: ''
  });

  useEffect(() => {
    const loadExpenseTypes = async () => {
      try {
        const response = await getExpenseTypes(token);
        // Si los datos están dentro de una propiedad 'data'
        const types = response.data || response;
        setExpenseTypes(Array.isArray(types) ? types : []);
        setError(null);
      } catch (err) {
        console.error('Error detallado:', err);
        setError('Error al cargar los tipos de gasto');
      } finally {
        setLoading(false);
      }
    };

    loadExpenseTypes();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError(null);

    try {
      await createExpense(token, {
        expense_type_id: parseInt(formData.expense_type_id),
        monto: parseFloat(formData.monto),
        descripcion: formData.descripcion
      });

      // Limpiar el formulario
      setFormData({
        expense_type_id: '',
        monto: '',
        descripcion: ''
      });

      // Llamar a onSuccess en lugar de refresh
      if (onSuccess) onSuccess();
      
    } catch (err) {
      setError('Error al registrar el gasto');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateType = async (e) => {
    e.preventDefault();
    if (creatingType) return;
    setCreatingType(true);
    setError(null);

    try {
      const newType = await createExpenseType(token, { nombre: newTypeName });
      setExpenseTypes([...expenseTypes, newType]);
      setNewTypeName('');
      setShowNewTypeForm(false);
    } catch (err) {
      console.error('Error:', err);
      setError('Error al crear el tipo de gasto');
    } finally {
      setCreatingType(false);
    }
  };

  if (loading) return <div className="text-center py-4">Cargando...</div>;
  if (error) return <div className="text-center text-dark-error py-4">{error}</div>;


  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Tipo de gasto */}
      <div>
        <div className="flex justify-between items-center mb-1">
          <label className="block text-sm font-medium text-dark-text">
            Tipo de gasto
          </label>
          <button
            type="button"
            onClick={() => setShowNewTypeForm(!showNewTypeForm)}
            disabled={creatingType}
            className="text-sm text-dark-primary hover:text-dark-primary/80 disabled:opacity-50"
          >
            {showNewTypeForm ? 'Cancelar' : 'Nuevo tipo'}
          </button>
        </div>

        {showNewTypeForm ? (
          <div className="space-y-2">
            <input
              type="text"
              value={newTypeName}
              onChange={(e) => setNewTypeName(e.target.value)}
              disabled={creatingType}
              className="w-full px-3 py-2 bg-dark-surface border border-dark-text/10 rounded-lg focus:outline-none focus:border-dark-primary disabled:opacity-50"
              placeholder="Nombre del nuevo tipo"
            />
            <button
              type="button"
              onClick={handleCreateType}
              disabled={creatingType || !newTypeName.trim()}
              className={`w-full bg-dark-primary text-white py-2 rounded-lg transition-opacity ${
                creatingType || !newTypeName.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:bg-dark-primary/90'
              }`}
            >
              {creatingType ? 'Creando...' : 'Crear tipo de gasto'}
            </button>
          </div>
        ) : (
          <select
            value={formData.expense_type_id}
            onChange={(e) => setFormData({...formData, expense_type_id: e.target.value})}
            disabled={submitting}
            className="w-full px-3 py-2 bg-dark-surface border border-dark-text/10 rounded-lg focus:outline-none focus:border-dark-primary text-dark-text disabled:opacity-50"
            required
          >
            <option value="" className="text-dark-text">Selecciona un tipo</option>
            {expenseTypes && expenseTypes.length > 0 ? (
              expenseTypes.map(type => (
                <option 
                  key={type.id} 
                  value={type.id} 
                  className="text-dark-text bg-dark-surface"
                >
                  {type.nombre}
                </option>
              ))
            ) : (
              <option value="" disabled>No hay tipos disponibles</option>
            )}
          </select>
        )}
      </div>

      {/* Monto */}
      <div>
        <label className="block text-sm font-medium text-dark-text mb-1">
          Monto
        </label>
        <div className="relative">
          <span className="absolute left-3 top-2 text-dark-text/50"> €</span>
          <input
            type="number"
            value={formData.monto}
            onChange={(e) => setFormData({...formData, monto: e.target.value})}
            disabled={submitting}
            className="w-full pl-8 pr-3 py-2 bg-dark-surface border border-dark-text/10 rounded-lg focus:outline-none focus:border-dark-primary disabled:opacity-50"
            placeholder="0.00"
            step="0.01"
            min="0"
            required
          />
        </div>
      </div>

      {/* Descripción */}
      <div>
        <label className="block text-sm font-medium text-dark-text mb-1">
          Descripción
        </label>
        <textarea
          value={formData.descripcion}
          onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
          disabled={submitting}
          className="w-full px-3 py-2 bg-dark-surface border border-dark-text/10 rounded-lg focus:outline-none focus:border-dark-primary min-h-[100px] disabled:opacity-50"
          placeholder="Describe el gasto..."
          required
        />
      </div>

      {error && (
        <div className="text-dark-error text-sm">{error}</div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className={`w-full bg-dark-primary hover:bg-dark-surface-hover text-white py-3 rounded-lg transition-opacity ${
          submitting ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'
        }`}
      >
        {submitting ? 'Registrando...' : 'Registrar Gasto'}
      </button>
    </form>
  );
} 