// src/components/CorteCajaModal.jsx
import { useState, useEffect } from 'react';
import { obtenerCorteCaja } from '../api/dashboardService';

export default function CorteCajaModal({ isOpen, onClose }) {
    const [datosCaja, setDatosCaja] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            setCargando(true);
            obtenerCorteCaja()
                .then(data => setDatosCaja(data))
                .catch(err => setError('Error al obtener el balance operativo.'))
                .finally(() => setCargando(false));
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
                <div className="bg-slate-800 px-6 py-4 flex justify-between items-center">
                    <h2 className="text-white text-lg font-bold">Cierre de Caja Diario</h2>
                    <button onClick={onClose} className="text-slate-300 hover:text-white font-bold">✕</button>
                </div>
                
                <div className="p-6">
                    {cargando ? (
                        <p className="text-center text-slate-500 py-4">Calculando balance...</p>
                    ) : error ? (
                        <p className="text-red-500 text-center">{error}</p>
                    ) : datosCaja ? (
                        <div className="space-y-4">
                            <div className="flex justify-between border-b pb-2">
                                <span className="text-slate-600">Fecha Operativa:</span>
                                <span className="font-semibold">{datosCaja.fecha}</span>
                            </div>
                            <div className="flex justify-between border-b pb-2">
                                <span className="text-slate-600">Transacciones Totales:</span>
                                <span className="font-semibold">{datosCaja.total_operaciones}</span>
                            </div>
                            
                            <div className="pt-2">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-green-600 font-medium">Ingresos (Pagos recibidos):</span>
                                    <span className="text-green-700 font-bold">
                                        ${datosCaja.ingresos.toLocaleString('es-MX', {minimumFractionDigits: 2})}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-red-500 font-medium">Egresos (Créditos otorgados):</span>
                                    <span className="text-red-600 font-bold">
                                        -${datosCaja.egresos.toLocaleString('es-MX', {minimumFractionDigits: 2})}
                                    </span>
                                </div>
                            </div>
                            
                            <div className="bg-slate-50 p-4 rounded mt-4 flex justify-between items-center border border-slate-200">
                                <span className="text-slate-800 font-bold uppercase text-sm">Balance Neto</span>
                                <span className={`text-xl font-black ${datosCaja.balance_neto >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    ${datosCaja.balance_neto.toLocaleString('es-MX', {minimumFractionDigits: 2})}
                                </span>
                            </div>
                            <p className="text-xs text-slate-400 text-center mt-2">
                                Solicitado por: {datosCaja.solicitado_por}
                            </p>
                        </div>
                    ) : null}
                </div>
                
                <div className="bg-slate-50 px-6 py-3 flex justify-end border-t border-slate-200">
                    <button 
                        onClick={onClose}
                        className="bg-slate-800 text-white px-4 py-2 rounded text-sm font-medium hover:bg-slate-700 transition"
                    >
                        Cerrar Reporte
                    </button>
                </div>
            </div>
        </div>
    );
}