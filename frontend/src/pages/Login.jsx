import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login, loginWithGoogle } = useAuth();

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

  const handleGoogleLogin = (e) => {
    e.preventDefault();
    console.log('Iniciando login con Google...');
    loginWithGoogle();
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

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-dark-text/10"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-dark-surface text-dark-text/60">
                O continúa con
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            className="mt-4 w-full flex items-center justify-center gap-2 bg-white text-gray-700 border border-gray-300 rounded-lg px-4 py-2 hover:bg-gray-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span>Continuar con Google</span>
          </button>
        </div>
      </div>
    </div>
  )
}
