// src/api/axiosConfig.js
import axios from 'axios';

// 1. Configuración base
const apiClient = axios.create({
    baseURL: 'https://sistema-creditos-tw1k.onrender.com',
    headers: {
        'Content-Type': 'application/json'
    }
});

// 2. Interceptor de PETICIÓN (Inyecta el token en cada viaje al backend)
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('finami_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// 3. NUEVO: Interceptor de RESPUESTA (Vigilante de seguridad)
apiClient.interceptors.response.use(
    (response) => {
        // Si todo sale bien (Código 200), deja pasar la respuesta
        return response;
    },
    (error) => {
        // Si el backend responde con un 401 (No Autorizado) o 403 (Prohibido)
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            console.warn("Sesión expirada o inválida. Cerrando sesión por seguridad.");
            
            // Destruimos el token contaminado o expirado
            localStorage.removeItem('finami_token');
            
            // Forzamos la redirección a la pantalla de login limpiando el estado de React
            window.location.href = '/login'; 
        }
        return Promise.reject(error);
    }
);

export default apiClient;