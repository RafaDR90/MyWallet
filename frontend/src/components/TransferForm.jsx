import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { transferMoney, getBalance } from '../services/api';

export default function TransferForm({ onClose, onSuccess }) {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [balance, setBalance] = useState(null);
  const [formData, setFormData] = useState({
    origen: 'banco',
    cantidad: '',
    descripcion: '',
    tipo: 'banco_a_cajon'
  });

  useEffect(() => {
    const loadBalance = async () => {
      try {
        const data = await getBalance(token);
        setBalance(data);
      } catch (error) {
        console.error('Error al cargar el balance:', error);
        setError('Error al cargar el balance');
      }
    };
    loadBalance();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    const amount = parseFloat(formData.cantidad);
    if (!amount || amount <= 0) {
      setError('Por favor, introduce una cantidad válida');
      return;
    }

    if (!balance) {
      setError('No se puede realizar la transferencia sin información del balance');
      return;
    }

    if (formData.origen === 'banco' && amount > balance.banco) {
      setError(`Fondos insuficientes en el banco. Balance disponible: ${balance.banco}€`);
      return;
    }

    if (formData.origen === 'cajon' && amount > balance.cajon) {
      setError(`Fondos insuficientes en el cajón. Balance disponible: ${balance.cajon}€`);
      return;
    }

    setLoading(true);
    try {
      await transferMoney(token, {
        cantidad: amount,
        tipo: formData.origen === 'banco' ? 'banco_a_cajon' : 'cajon_a_banco',
        descripcion: formData.descripcion || 'Transferencia'
      });
      onSuccess();
    } catch (error) {
      console.error('Error:', error);
      setError(error.message || 'Error al realizar la transferencia');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const toggleDirection = () => {
    setFormData(prev => ({
      ...prev,
      origen: prev.origen === 'banco' ? 'cajon' : 'banco'
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-red-500 text-sm">{error}</p>
        </div>
      )}

      <div className="flex items-center justify-between gap-4 p-4 bg-dark-bg rounded-lg">
        <div className="text-center flex-1">
          <p className="text-sm text-dark-text/70">Desde</p>
          <p className="text-lg font-semibold text-dark-primary">
            {formData.origen === 'banco' ? 'Banco' : 'Cartera'}
          </p>
          {balance && (
            <p className="text-[11px] text-gray-400">
              Disponible: {formData.origen === 'banco' ? balance.banco : balance.cajon}€
            </p>
          )}
        </div>
        
        <button 
          type="button"
          onClick={toggleDirection}
          className="p-2 hover:bg-dark-text/10 rounded-full transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
        </button>

        <div className="text-center flex-1">
          <p className="text-sm text-dark-text/70">Hacia</p>
          <p className="text-lg font-semibold text-dark-primary">
            {formData.origen === 'banco' ? 'Cartera' : 'Banco'}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-dark-text/70 mb-1">
            Cantidad (€)
          </label>
          <input
            type="number"
            name="cantidad"
            step="0.01"
            value={formData.cantidad}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-dark-bg border border-dark-border rounded-lg focus:outline-none focus:border-dark-primary text-dark-text"
            placeholder="0.00"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-dark-text/70 mb-1">
            Descripción (opcional)
          </label>
          <input
            type="text"
            name="descripcion"
            value={formData.descripcion}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-dark-bg border border-dark-border rounded-lg focus:outline-none focus:border-dark-primary text-dark-text"
            placeholder="Añade una nota"
          />
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 px-4 py-2 bg-dark-bg text-dark-text rounded-lg hover:bg-dark-bg/70 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-4 py-2 bg-dark-primary text-black rounded-lg hover:bg-dark-primary/90 transition-colors disabled:opacity-50"
        >
          {loading ? 'Transfiriendo...' : 'Transferir'}
        </button>
      </div>
    </form>
  );
} 