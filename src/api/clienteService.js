// src/api/clienteService.js
import apiClient from './axiosConfig';

export const obtenerClientes = async (incluirInactivos = false) => {
    try {
        const response = await apiClient.get(`/api/v1/clientes?incluir_inactivos=${incluirInactivos}`);
        return response.data;
    } catch (error) {
        console.error("Error obteniendo el listado de clientes:", error);
        throw error;
    }
};

export const crearCliente = async (clienteData) => {
    try {
        const response = await apiClient.post('/api/v1/clientes/', clienteData);
        return response.data;
    } catch (error) {
        // Extraemos el mensaje de error de FastAPI (ej. Error 409: RFC Duplicado)
        const mensajeError = error.response?.data?.detail || "Error al registrar el cliente";
        throw new Error(mensajeError);
    }
};

export const archivarCliente = async (rfc) => {
    try {
        await apiClient.patch(`/api/v1/clientes/${rfc}/archivar`);
        return true;
    } catch (error) {
        const mensajeError = error.response?.data?.detail || "Error al archivar el cliente";
        throw new Error(mensajeError);
    }
};