import { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext();

const API_URL = import.meta.env.VITE_API_URL;

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const navigate = useNavigate();

  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Error al iniciar sesión');
      }

      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser(data.user);
      setIsAuthenticated(true);

      return data;
    } catch (error) {
      console.error('Error en login:', error);
      throw new Error(error.message || 'Error al iniciar sesión');
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await fetch(`${API_URL}/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        });
      }
    } catch (error) {
      console.error('Error durante el logout:', error);
    } finally {
      // Limpiar estado local independientemente del resultado de la petición
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
      navigate('/login');
    }
  };

  // Función para manejar la expiración del token
  const handleTokenExpiration = () => {
    logout();
  };

  const loginWithGoogle = () => {
    const googleAuthUrl = `${API_URL}/auth/google`;
    
    setTimeout(() => {
        window.location.href = googleAuthUrl;
    }, 100);
  };

  useEffect(() => {
    const handleCallback = () => {
      
      const params = new URLSearchParams(window.location.search);
      
      const token = params.get('token');
      const email = params.get('email');
      const name = params.get('name');
      const avatar = params.get('avatar');


      if (token) {
        localStorage.setItem('token', token);
        setToken(token);
        setUser({ email, name, avatar });
        setIsAuthenticated(true);
        navigate('/', { replace: true });
      }
    };

    
    if (window.location.pathname === '/auth/callback') {
      handleCallback();
    }
  }, [navigate]);


  return (
    <AuthContext.Provider value={{
      token,
      setToken,
      user,
      setUser,
      isAuthenticated,
      setIsAuthenticated,
      login,
      logout,
      loginWithGoogle,
      handleTokenExpiration
    }}>
      {children}
    </AuthContext.Provider>
  );
} 