import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (password !== passwordConfirmation) {
      setError('Las contraseñas no coinciden');
      setIsLoading(false);
      return;
    }

    try {
      await register(name, email, password, passwordConfirmation);
      navigate('/');
    } catch (err) {
      setError('Error al crear la cuenta. Por favor, verifica los datos.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-dark-surface rounded-lg shadow-lg p-6 md:p-8">
        <h2 className="text-xl font-semibold brand-text mb-6 text-center">
          Crear Cuenta
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-dark-error/10 border border-dark-error/20 rounded-lg text-dark-error text-sm">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-dark-text/80 text-sm mb-2 font-medium">
              Nombre
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 bg-dark-bg border border-dark-text/10 rounded-lg text-dark-text 
                       focus:border-dark-primary focus:ring-1 focus:ring-dark-primary transition-colors
                       placeholder:text-dark-text/30"
              placeholder="Tu nombre"
              required
            />
          </div>

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

          <div>
            <label className="block text-dark-text/80 text-sm mb-2 font-medium">
              Confirmar Contraseña
            </label>
            <input
              type="password"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
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
            {isLoading ? 'Creando cuenta...' : 'Crear Cuenta'}
          </button>

          <p className="text-center text-dark-text/60 text-sm mt-6">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="text-dark-primary hover:opacity-80 transition-opacity">
              Inicia Sesión
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}