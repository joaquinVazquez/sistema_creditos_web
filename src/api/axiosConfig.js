// src/api/axiosConfig.js
import axios from 'axios';

// 1. Creamos la instancia apuntando a la URL del .env
const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// 2. Interceptor de Peticiones: Inyecta el JWT antes de enviar datos al servidor
apiClient.interceptors.request.use(
    (config) => {
        // En la web, guardaremos el token en el almacenamiento del navegador (localStorage)
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