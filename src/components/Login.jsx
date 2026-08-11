// src/components/Login.jsx
import { useState } from 'react';
import { loginUsuario } from '../api/authService';

export default function Login({ onLoginSuccess }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [cargando, setCargando] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault(); // Evita que la página se recargue
        setError('');
        setCargando(true);

        try {
            const exito = await loginUsuario(username, password);
            if (exito) {
                onLoginSuccess(); // Avisa a la aplicación principal que ya entramos
            }
        } catch (err) {
            setError('Credenciales incorrectas o servidor inactivo.');
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-sm border-t-4 border-blue-600">
                <div className="text-center mb-6">
                    <h1 className="text-3xl font-bold text-slate-800">FINAMI</h1>
                    <p className="text-sm text-slate-500">Sistema de Gestión - SaaS Web</p>
                </div>

                {error && (
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 mb-4 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Usuario</label>
                        <input 
                            type="text" 
                            className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Contraseña</label>
                        <input 
                            type="password" 
                            className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button 
                        type="submit" 
                        disabled={cargando}
                        className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 transition disabled:opacity-50"
                    >
                        {cargando ? 'Verificando...' : 'Iniciar Sesión'}
                    </button>
                </form>
            </div>
        </div>
    );
}