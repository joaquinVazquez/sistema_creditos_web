// src/context/AuthContext.jsx
import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [usuario, setUsuario] = useState(null);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        // Al recargar la página, busca si ya hay una sesión activa usando tus claves
        const token = localStorage.getItem('finami_token');
        const userData = localStorage.getItem('finami_usuario');
        
        if (token && userData) {
            setUsuario(JSON.parse(userData));
        }
        setCargando(false);
    }, []);

    // Esta función la llamaremos desde tu Login.jsx cuando FastAPI responda OK
    const iniciarSesion = (token, datosUsuario) => {
        localStorage.setItem('finami_token', token);
        localStorage.setItem('finami_usuario', JSON.stringify(datosUsuario));
        setUsuario(datosUsuario);
    };

    // Esta función se llama desde App.jsx al hacer Logout
    const cerrarSesion = () => {
        localStorage.removeItem('finami_token');
        localStorage.removeItem('finami_usuario');
        setUsuario(null);
    };

    if (cargando) {
        return <div className="flex h-screen items-center justify-center text-slate-500">Cargando sistema de seguridad...</div>;
    }

    return (
        <AuthContext.Provider value={{ usuario, iniciarSesion, cerrarSesion }}>
            {children}
        </AuthContext.Provider>
    );
};