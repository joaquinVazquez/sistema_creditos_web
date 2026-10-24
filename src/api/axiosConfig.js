// src/api/axiosConfig.js
import axios from 'axios';

const apiClient = axios.create({
    baseURL: 'http://localhost:8000',
});

// Interceptor: Se ejecuta antes de enviar cualquier petición al backend
apiClient.interceptors.request.use(
    (config) => {
        // CORRECCIÓN: Usar la misma clave que guardamos en AuthContext
        const token = localStorage.getItem('finami_token'); 
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default apiClient;