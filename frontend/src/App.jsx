import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
/* import Expenses from './pages/Expenses'
import Transfers from './pages/Transfers' */
import ProtectedRoute from './components/ProtectedRoute'
import AuthRoute from './components/AuthRoute'
import './App.css'

function App() {
  return (
    <Routes>
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

export default App
