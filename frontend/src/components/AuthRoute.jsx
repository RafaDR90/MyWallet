import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function AuthRoute({ children }) {
  const { isAuthenticated } = useAuth();
  
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  return children;
} 