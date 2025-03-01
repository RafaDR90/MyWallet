import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { addToBanco, addToCajon } from '../services/api';
import { motion } from 'framer-motion';

export default function DepositForm({ onSuccess, onClose, refreshBalance, onRefresh }) {
  const { token } = useAuth();
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [destination, setDestination] = useState('banco'); // 'banco' o 'cajon'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const depositFunction = destination === 'banco' ? addToBanco : addToCajon;
      await depositFunction(token, {
        cantidad: parseFloat(amount),
        descripcion: description
      });

      // Actualizar balance y refrescar History
      refreshBalance();
      if (onRefresh) {
        onRefresh();
      }
      
      if (onSuccess) {
        onSuccess();
      }

      // Cerrar el panel y limpiar el formulario
      onClose();
      setAmount('');
      setDescription('');
    } catch (error) {
      setError('Error al procesar el ingreso');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-dark-primary mb-6">Ingresar Dinero</h2>
      
      <form onSubmit={handleSubmit} className="bg-dark-bg p-6 rounded-lg shadow-lg">
        <div className="mb-6">
          <label className="block text-dark-text mb-2">Destino</label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setDestination('banco')}
              className={`p-4 rounded-lg ${
                destination === 'banco' 
                  ? 'bg-dark-primary text-black' 
                  : 'bg-dark-surface text-dark-text'
              }`}
            >
              Banco
            </button>
            <button
              type="button"
              onClick={() => setDestination('cajon')}
              className={`p-4 rounded-lg ${
                destination === 'cajon' 
                  ? 'bg-dark-primary text-black' 
                  : 'bg-dark-surface text-dark-text'
              }`}
            >
              Cartera
            </button>
          </div>
        </div>

        <div className="mb-6">
          <label htmlFor="amount" className="block text-dark-text mb-2">
            Cantidad (€)
          </label>
          <input
            type="number"
            id="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-dark-surface text-dark-text p-3 rounded-lg"
            step="0.01"
            min="0.01"
            required
          />
        </div>

        <div className="mb-6">
          <label htmlFor="description" className="block text-dark-text mb-2">
            Descripción
          </label>
          <input
            type="text"
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-dark-surface text-dark-text p-3 rounded-lg"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-dark-primary hover:bg-dark-surface-hover text-black p-4 rounded-lg font-semibold  transition-colors"
        >
          {loading ? 'Procesando...' : 'Ingresar'}
        </button>

        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-red-500 mt-4 text-center"
          >
            {error}
          </motion.p>
        )}

        {success && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-green-500 mt-4 text-center"
          >
            Ingreso realizado con éxito
          </motion.p>
        )}
      </form>
    </div>
  );
} 