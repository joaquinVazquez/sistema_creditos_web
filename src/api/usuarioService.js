// src/api/usuarioService.js
import api from './axiosConfig';

export const usuarioService = {
  obtenerUsuarios: async () => {
    try {
      const response = await api.get('/api/v1/usuarios/');
      return response.data;
    } catch (error) {
      console.error("Error al obtener usuarios:", error);
      throw error;
    }
  },

  crearUsuario: async (userData) => {
    try {
      const response = await api.post('/api/v1/usuarios/', userData);
      return response.data;
    } catch (error) {
      console.error("Error al crear usuario:", error);
      throw error;
    }
  }
};