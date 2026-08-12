// src/api/dashboardService.js
import apiClient from './axiosConfig';

export const obtenerMetricasDashboard = async () => {
    try {
        const response = await apiClient.get('/api/v1/dashboard/metricas'); 
        return response.data;
    } catch (error) {
        console.error("Error obteniendo métricas:", error);
        throw error;
    }
};

export const obtenerCorteCaja = async (fecha = null) => {
    try {
        // Si no se envía fecha, el backend tomará la del día actual automáticamente
        const url = fecha ? `/api/v1/dashboard/corte-caja?fecha=${fecha}` : '/api/v1/dashboard/corte-caja';
        const response = await apiClient.get(url);
        return response.data;
    } catch (error) {
        console.error("Error al generar corte de caja:", error);
        throw error;
    }
};