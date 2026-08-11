// src/App.jsx
import { useState, useEffect } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import { logoutUsuario } from './api/authService';

function App() {
  const [autenticado, setAutenticado] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('finami_token');
    if (token) {
      setAutenticado(true);
    }
  }, []);

  const manejarLogout = () => {
    logoutUsuario();
    setAutenticado(false);
  };

  // Si no hay token, muestra el componente de Login
  if (!autenticado) {
    return <Login onLoginSuccess={() => setAutenticado(true)} />;
  }

  // Si hay token, renderiza el Dashboard profesional con las tarjetas KPI
  return <Dashboard onLogout={manejarLogout} />;
}

export default App;