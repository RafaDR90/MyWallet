import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
/* import Expenses from './pages/Expenses'
import Transfers from './pages/Transfers' */
import ProtectedRoute from './components/ProtectedRoute'
import AuthRoute from './components/AuthRoute'
import './App.css'
import { useEffect } from 'react'
import { useAuth } from './hooks/useAuth'

function App() {
  return (
    <Routes>
      <Route path="/auth/callback" element={<AuthCallbackHandler />} />
      <Route path="/" element={<Layout />}>
        {/* Rutas protegidas */}
        <Route index element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        } />
        {/* <Route path="expenses" element={
          <ProtectedRoute>
            <Expenses />
          </ProtectedRoute>
        } /> */}
        {/* <Route path="transfers" element={
          <ProtectedRoute>
            <Transfers />
          </ProtectedRoute>
        } /> */}

        {/* Rutas de autenticación */}
        <Route path="login" element={
          <AuthRoute>
            <Login />
          </AuthRoute>
        } />
        <Route path="register" element={
          <AuthRoute>
            <Register />
          </AuthRoute>
        } />

        {/* Redirigir cualquier otra ruta a login si no está autenticado, o a home si lo está */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Route>
    </Routes>
  )
}

// Componente para manejar el callback
function AuthCallbackHandler() {
  const navigate = useNavigate()
  const { setToken, setUser, setIsAuthenticated } = useAuth()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')
    const email = params.get('email')
    const name = params.get('name')
    const avatar = params.get('avatar')

    console.log('Parámetros recibidos en callback:', {
      token, email, name, avatar
    })

    if (token) {
      localStorage.setItem('token', token)
      setToken(token)
      setUser({ email, name, avatar })
      setIsAuthenticated(true)
      navigate('/', { replace: true })
    } else {
      navigate('/login', { replace: true })
    }
  }, [navigate, setToken, setUser, setIsAuthenticated])

  return <div>Autenticando...</div>
}

export default App
