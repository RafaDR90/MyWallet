import { useState } from 'react';
import { Link } from 'react-router-dom';
const API_URL = import.meta.env.VITE_API_URL;


export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setStatus(null);

    try {
      const response = await fetch(`${API_URL}/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al enviar el email');
      }

      setStatus('Se ha enviado un enlace de recuperación a tu email');
      setEmail('');
    } catch (err) {
      setError(err.message || 'Error al procesar la solicitud');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-dark-surface rounded-lg shadow-lg p-6 md:p-8">
        <h2 className="text-xl font-semibold text-dark-text mb-6 text-center">
          Restablecer Contraseña
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-dark-error/10 border border-dark-error/20 rounded-lg text-dark-error text-sm">
            {error}
          </div>
        )}

        {status && (
          <div className="mb-4 p-3 bg-dark-success/10 border border-dark-success/20 rounded-lg text-dark-success text-sm">
            {status}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-dark-text/80 text-sm mb-2 font-medium">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 bg-dark-bg border border-dark-text/10 rounded-lg text-dark-text 
                       focus:border-dark-primary focus:ring-1 focus:ring-dark-primary transition-colors
                       placeholder:text-dark-text/30"
              placeholder="tu@email.com"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-dark-primary text-dark-on-primary rounded-lg font-medium 
                     hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Enviando...' : 'Enviar enlace de recuperación'}
          </button>
        </form>

        <p className="text-center text-dark-text/60 text-sm mt-6">
          <Link to="/login" className="text-dark-primary hover:opacity-80 transition-opacity">
            Volver al login
          </Link>
        </p>
      </div>
    </div>
  );
} 