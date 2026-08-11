// src/App.jsx
import { useState, useEffect } from 'react';
import Login from './components/Login';
import { logoutUsuario } from './api/authService';

function App() {
  const [autenticado, setAutenticado] = useState(false);

  // Al cargar la app, verifica si ya hay un token guardado en el navegador
  useEffect(() => {
    const token = localStorage.getItem('finami_token');
    if (token) setAutenticado(true);
  }, []);

  const manejarLogout = () => {
    logoutUsuario();
    setAutenticado(false);
  };

  // Si no está autenticado, dibuja la pantalla de Login
  if (!autenticado) {
    return <Login onLoginSuccess={() => setAutenticado(true)} />;
  }

  // Si SÍ está autenticado, dibuja el Dashboard (Mockup temporal)
  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded shadow">
        <div className="flex justify-between items-center border-b pb-4 mb-4">
          <h1 className="text-2xl font-bold text-slate-800">Dashboard FINAMI</h1>
          <button 
            onClick={manejarLogout}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Cerrar Sesión
          </button>
        </div>
        <p className="text-slate-600">¡Conexión HTTP Exitosa! El token JWT ha sido almacenado en el navegador.</p>
      </div>
    </div>
  );
}

export default App;