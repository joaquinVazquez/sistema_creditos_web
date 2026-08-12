// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import PerfilCliente from './components/PerfilCliente';
import { logoutUsuario } from './api/authService';

export default function App() {
  const [autenticado, setAutenticado] = useState(false);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('finami_token');
    if (token) {
      setAutenticado(true);
    }
    setCargando(false);
  }, []);

  const manejarLogout = () => {
    logoutUsuario();
    setAutenticado(false);
  };

  if (cargando) {
    return <div className="flex h-screen items-center justify-center text-slate-500">Cargando sistema...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* RUTA DE LOGIN: Si ya está autenticado, lo manda directo al Dashboard */}
        <Route 
          path="/login" 
          element={
            autenticado ? 
            <Navigate to="/" replace /> : 
            <Login onLoginSuccess={() => setAutenticado(true)} />
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