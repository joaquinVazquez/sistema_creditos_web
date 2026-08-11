// src/api/authService.js
import apiClient from './axiosConfig';

export const loginUsuario = async (username, password) => {
    try {
        // FastAPI exige formato "x-www-form-urlencoded" para el login
        const params = new URLSearchParams();
        params.append('username', username);
        params.append('password', password);

        const response = await apiClient.post('/api/v1/auth/login', params, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        
        if (response.data && response.data.access_token) {
            // Guardamos el token en la memoria del navegador
            localStorage.setItem('finami_token', response.data.access_token);
            return true;
        }
        return false;
    } catch (error) {
        console.error("Error en autenticación:", error);
        throw error;
    }
};

export const logoutUsuario = () => {
    localStorage.removeItem('finami_token');
};