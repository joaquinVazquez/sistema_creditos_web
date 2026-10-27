// src/components/PanelUsuarios.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { usuarioService } from '../api/usuarioService';

const PanelUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    rol_id: 2 // Por defecto creamos Cajeros (2)
  });
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });

  const cargarUsuarios = async () => {
    try {
      const data = await usuarioService.obtenerUsuarios();
      setUsuarios(data);
    } catch (error) {
      console.error("Error al cargar la lista:", error);
    }
  };

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await usuarioService.crearUsuario({
        ...formData,
        rol_id: parseInt(formData.rol_id)
      });
      setMensaje({ tipo: 'success', texto: 'Usuario creado exitosamente' });
      setFormData({ username: '', password: '', rol_id: 2 });
      cargarUsuarios(); // Recargar la tabla
      
      setTimeout(() => setMensaje({ tipo: '', texto: '' }), 3000);
    } catch (error) {
      setMensaje({ 
        tipo: 'error', 
        texto: error.response?.data?.detail || 'Error al crear el usuario' 
      });
      setTimeout(() => setMensaje({ tipo: '', texto: '' }), 4000);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* BARRA SUPERIOR CON NAVEGACIÓN */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Gestión de Personal</h1>
        <Link 
          to="/" 
          className="bg-slate-200 text-slate-700 px-4 py-2 rounded text-sm font-medium hover:bg-slate-300 transition shadow-sm flex items-center gap-2"
        >
          ← Volver al Dashboard
        </Link>
      </div>
      
      {mensaje.texto && (
        <div className={`p-4 mb-6 rounded ${mensaje.tipo === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {mensaje.texto}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Formulario de Alta */}
        <div className="bg-white p-6 rounded shadow border">
          <h2 className="text-lg font-semibold mb-4">Nuevo Usuario</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Nombre de Usuario</label>
              <input 
                type="text" 
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full border rounded p-2"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Contraseña</label>
              <input 
                type="password" 
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full border rounded p-2"
                required
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium mb-1">Rol del Sistema</label>
              <select 
                name="rol_id" 
                value={formData.rol_id} 
                onChange={handleChange}
                className="w-full border rounded p-2"
              >
                <option value={2}>Cajero (Operativo)</option>
                <option value={1}>Administrador (Acceso Total)</option>
              </select>
            </div>
            <button 
              type="submit" 
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            >
              Registrar Usuario
            </button>
          </form>
        </div>

        {/* Tabla de Usuarios */}
        <div className="md:col-span-2 bg-white p-6 rounded shadow border">
          <h2 className="text-lg font-semibold mb-4">Usuarios Activos</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="p-3">ID</th>
                  <th className="p-3">Usuario</th>
                  <th className="p-3">Rol</th>
                  <th className="p-3">Estado</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map(u => (
                  <tr key={u.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">{u.id}</td>
                    <td className="p-3 font-medium">{u.username}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs ${u.rol_id === 1 ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                        {u.rol_id === 1 ? 'Admin' : 'Cajero'}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs ${u.activo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                        {u.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PanelUsuarios;