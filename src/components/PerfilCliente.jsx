// src/components/PerfilCliente.jsx
import { useParams, useNavigate } from 'react-router-dom';

export default function PerfilCliente() {
    // useParams extrae las variables dinámicas de la URL (en este caso, el RFC)
    const { rfc } = useParams();
    const navigate = useNavigate();

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <button 
                onClick={() => navigate('/')} 
                className="mb-6 flex items-center text-slate-500 hover:text-blue-600 font-medium transition"
            >
                <span className="mr-2">←</span> Volver al Panel Principal
            </button>
            
            <div className="bg-white rounded-lg shadow-md border border-slate-200 p-6 min-h-[400px]">
                <h1 className="text-2xl font-bold text-slate-800">Expediente de Cliente</h1>
                <p className="text-slate-500 font-mono mt-1 mb-8">RFC Operativo: {rfc}</p>
                
                <div className="border-2 border-dashed border-slate-200 rounded-lg p-10 flex flex-col items-center justify-center text-slate-400">
                    <p>Aquí se montará el módulo de Estado de Cuenta, Créditos y Pagos.</p>
                </div>
            </div>
        </div>
    );
}