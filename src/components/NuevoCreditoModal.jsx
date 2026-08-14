// src/components/NuevoCreditoModal.jsx
import { useState } from 'react';
import { crearCredito } from '../api/creditoService';

export default function NuevoCreditoModal({ isOpen, onClose, rfcCliente, onCreditoCreado }) {
    const [formData, setFormData] = useState({
        monto: '',
        tasa_global: '',
        plazos_semanas: ''
    });
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setCargando(true);
        setError('');

        try {
            await crearCredito({
                rfc_cliente: rfcCliente, // Se inyecta automáticamente por props
                monto: parseFloat(formData.monto),
                tasa_global: parseFloat(formData.tasa_global),
                plazos_semanas: parseInt(formData.plazos_semanas)
            });
            onCreditoCreado();
            onClose();
            // Limpiamos el formulario tras el éxito
            setFormData({ monto: '', tasa_global: '', plazos_semanas: '' });
        } catch (err) {
            setError(err.message);
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
                <div className="bg-slate-800 px-6 py-4 flex justify-between items-center">
                    <h2 className="text-white text-lg font-bold">Otorgar Nuevo Crédito</h2>
                    <button onClick={onClose} className="text-slate-300 hover:text-white font-bold">✕</button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6">
                    {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm border border-red-200">{error}</div>}
                    
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Monto del Préstamo ($)*</label>
                            <input 
                                type="number" step="0.01" name="monto" required min="1"
                                className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500"
                                value={formData.monto} onChange={handleChange}
                                placeholder="Ej. 5000"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Tasa de Interés Global (%)*</label>
                            <input 
                                type="number" step="0.01" name="tasa_global" required min="0"
                                className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500"
                                value={formData.tasa_global} onChange={handleChange}
                                placeholder="Ej. 10"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Plazo (Semanas)*</label>
                            <input 
                                type="number" name="plazos_semanas" required min="1"
                                className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500"
                                value={formData.plazos_semanas} onChange={handleChange}
                                placeholder="Ej. 12"
                            />
                        </div>
                    </div>
                    
                    <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded transition">Cancelar</button>
                        <button type="submit" disabled={cargando} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition disabled:opacity-50">
                            {cargando ? 'Procesando...' : 'Autorizar Crédito'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}