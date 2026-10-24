// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import PerfilCliente from './components/PerfilCliente';
import { logoutUsuario } from './api/authService';

// Extraemos las rutas a un componente interno para poder usar useContext
function RutasPrincipales() {
  const { usuario, cerrarSesion } = useContext(AuthContext);

  const manejarLogout = () => {
    logoutUsuario(); // Mantiene tu lógica original de la API
    cerrarSesion();  // Limpia el estado global del contexto
  };

  // Convertimos la existencia del usuario a un booleano (true/false)
  const autenticado = !!usuario;

  return (
    <BrowserRouter>
      <Routes>
        {/* RUTA DE LOGIN */}
        <Route 
          path="/login" 
          element={
            autenticado ? 
            <Navigate to="/" replace /> : 
            <Login /> 
          } 
        />

        {/* RUTA PROTEGIDA: Dashboard principal */}
        <Route 
          path="/" 
          element={
            autenticado ? 
            <Dashboard onLogout={manejarLogout} /> : 
            <Navigate to="/login" replace />
          } 
        />

        {/* RUTA PROTEGIDA: Expediente individual del cliente (RFC dinámico) */}
        <Route 
          path="/cliente/:rfc" 
          element={
            autenticado ? 
            <PerfilCliente /> : 
            <Navigate to="/login" replace />
          } 
        />

        {/* CUALQUIER OTRA RUTA INVÁLIDA: Redirige al inicio */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

// Componente principal que inyecta el estado global
export default function App() {
  return (
    <AuthProvider>
      <RutasPrincipales />
    </AuthProvider>
  );
}