// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import PerfilCliente from './components/PerfilCliente';
import PanelUsuarios from './components/PanelUsuarios'; // <-- NUEVA IMPORTACIÓN
import { logoutUsuario } from './api/authService';

function RutasPrincipales() {
  const { usuario, cerrarSesion } = useContext(AuthContext);

  const manejarLogout = () => {
    logoutUsuario();
    cerrarSesion();
  };

  const autenticado = !!usuario;
  // Comprobamos si es administrador de forma segura
  const esAdmin = usuario?.rol_id === 1;

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

        {/* RUTA PROTEGIDA: Expediente individual del cliente */}
        <Route 
          path="/cliente/:rfc" 
          element={
            autenticado ? 
            <PerfilCliente /> : 
            <Navigate to="/login" replace />
          } 
        />

        {/* NUEVA RUTA PROTEGIDA RBAC: Panel de Usuarios (Solo Admin) */}
        <Route 
          path="/usuarios" 
          element={
            autenticado ? (
              esAdmin ? <PanelUsuarios /> : <Navigate to="/" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />

        {/* CUALQUIER OTRA RUTA INVÁLIDA: Redirige al inicio */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <RutasPrincipales />
    </AuthProvider>
  );
}