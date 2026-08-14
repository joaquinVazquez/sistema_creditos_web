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