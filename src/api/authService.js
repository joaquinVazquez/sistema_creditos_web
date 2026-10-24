import apiClient from './axiosConfig';

export const loginUsuario = async (username, password) => {
    try {
        const params = new URLSearchParams();
        params.append('username', username);
        params.append('password', password);

        const response = await apiClient.post('/api/v1/auth/login', params, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        
        // Devolvemos toda la data (token + datos del usuario) al componente Login
        return response.data; 
    } catch (error) {
        console.error("Error en autenticación:", error);
        throw error;
    }
};

export const logoutUsuario = () => {
    // AuthContext ya limpia el localStorage. 
    // Esta función queda lista por si en el futuro necesitas hacer una petición de cierre al backend.
};