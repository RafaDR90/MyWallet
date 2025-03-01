import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError('Email o contraseña incorrectos');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-dark-surface rounded-lg shadow-lg p-6 md:p-8">
        <h2 className="text-xl font-semibold brand-text mb-6 text-center">
          Iniciar Sesión
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-dark-error/10 border border-dark-error/20 rounded-lg text-dark-error text-sm">
            {error}
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

          <div>
            <label className="block text-dark-text/80 text-sm mb-2 font-medium">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 bg-dark-bg border border-dark-text/10 rounded-lg text-dark-text 
                       focus:border-dark-primary focus:ring-1 focus:ring-dark-primary transition-colors
                       placeholder:text-dark-text/30"
              placeholder="********"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-dark-primary text-dark-on-primary rounded-lg font-medium 
                     hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>

          <p className="text-center text-dark-text/60 text-sm mt-6">
            ¿No tienes cuenta?{' '}
            <Link to="/register" className="text-dark-primary hover:opacity-80 transition-opacity">
              Regístrate
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
