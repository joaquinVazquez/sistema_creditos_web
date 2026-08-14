// src/api/pagoService.js
import apiClient from './axiosConfig';

export const registrarAbono = async (creditoId, montoAbono) => {
    try {
        const response = await apiClient.post('/api/v1/pagos/', {
            credito_id: creditoId,
            monto: parseFloat(montoAbono)
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.detail || "Error transaccional al procesar el abono.");
    }
};

// NUEVA FUNCIÓN: Cancelar un pago erróneo
export const revertirAbono = async (pagoId) => {
    try {
        const response = await apiClient.delete(`/api/v1/pagos/revertir/${pagoId}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.detail || "Error al cancelar el abono.");
    }
};