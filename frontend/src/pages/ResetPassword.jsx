import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    password_confirmation: '',
    token: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const email = searchParams.get('email');
    const token = searchParams.get('token');
    if (email && token) {
      setFormData(prev => ({ ...prev, email, token }));
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:8000/api/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al restablecer la contraseña');
      }

      navigate('/login', { 
        state: { message: 'Contraseña restablecida correctamente. Ya puedes iniciar sesión.' }
      });
    } catch (err) {
      setError(err.message || 'Error al procesar la solicitud');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-dark-surface rounded-lg shadow-lg p-6 md:p-8">
        <h2 className="text-xl font-semibold text-dark-text mb-6 text-center">
          Nueva Contraseña
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-dark-error/10 border border-dark-error/20 rounded-lg text-dark-error text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-dark-text/80 text-sm mb-2 font-medium">
              Nueva Contraseña
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full p-3 bg-dark-bg border border-dark-text/10 rounded-lg text-dark-text 
                       focus:border-dark-primary focus:ring-1 focus:ring-dark-primary transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-dark-text/80 text-sm mb-2 font-medium">
              Confirmar Contraseña
            </label>
            <input
              type="password"
              name="password_confirmation"
              value={formData.password_confirmation}
              onChange={handleChange}
              className="w-full p-3 bg-dark-bg border border-dark-text/10 rounded-lg text-dark-text 
                       focus:border-dark-primary focus:ring-1 focus:ring-dark-primary transition-colors"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-dark-primary text-dark-on-primary rounded-lg font-medium 
                     hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Restableciendo...' : 'Restablecer Contraseña'}
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