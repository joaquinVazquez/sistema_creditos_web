// src/api/creditoService.js
import apiClient from './axiosConfig';

export const obtenerHistorialCreditos = async (rfc) => {
    try {
        const response = await apiClient.get(`/api/v1/creditos/historial/${rfc}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.detail || "Error al cargar historial crediticio.");
    }
};

export const crearCredito = async (creditoData) => {
    try {
        const response = await apiClient.post('/api/v1/creditos/', creditoData);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.detail || "Error al registrar el crédito.");
    }
};

export const obtenerPagosPorCredito = async (idCredito) => {
    try {
        const response = await apiClient.get(`/api/v1/creditos/${idCredito}/pagos`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.detail || "Error al cargar historial de pagos.");
    }
};

export const obtenerMetricasCredito = async (idCredito) => {
    try {
        const response = await apiClient.get(`/api/v1/creditos/${idCredito}/metricas`);
        return response.data; // Retorna { cuota_semanal, semana_actual }
    } catch (error) {
        throw new Error("No se pudieron cargar las métricas del crédito.");
    }
};