import { useState, useEffect } from 'react';
import { crearCliente, actualizarCliente } from '../api/clienteService';

export default function NuevoClienteModal({ isOpen, onClose, onClienteCreado, clienteAEditar = null }) {
    const [formData, setFormData] = useState({
        rfc: '',
        nombre_completo: '',
        telefono: '',
        direccion: ''
    });
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState('');

    // Si pasamos un cliente, llena el formulario. Si no, lo limpia para un nuevo registro.
    useEffect(() => {
        if (isOpen && clienteAEditar) {
            setFormData({
                rfc: clienteAEditar.rfc || '',
                nombre_completo: clienteAEditar.nombre_completo || '',
                telefono: clienteAEditar.telefono || '',
                direccion: clienteAEditar.direccion || ''
            });
            setError('');
        } else if (isOpen) {
            setFormData({ rfc: '', nombre_completo: '', telefono: '', direccion: '' });
            setError('');
        }
    }, [isOpen, clienteAEditar]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setCargando(true);
        setError('');

        try {
            const datosFormateados = {
                ...formData,
                rfc: formData.rfc.toUpperCase()
            };

            if (clienteAEditar) {
                await actualizarCliente(clienteAEditar.rfc, datosFormateados);
                onClienteCreado(datosFormateados.rfc); // Pasamos el RFC por si cambió
            } else {
                await crearCliente(datosFormateados);
                onClienteCreado(datosFormateados.rfc);
            }
            
            onClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setCargando(false);
        }
    };

    const esEdicion = !!clienteAEditar;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
                <div className="bg-slate-800 px-6 py-4 flex justify-between items-center">
                    <h2 className="text-white text-lg font-bold">
                        {esEdicion ? 'Editar Cliente' : 'Registrar Nuevo Cliente'}
                    </h2>
                    <button onClick={onClose} className="text-slate-300 hover:text-white font-bold">✕</button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6">
                    {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm border border-red-200">{error}</div>}
                    
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">RFC (Identificador)*</label>
                            <input 
                                type="text" name="rfc" required
                                className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 uppercase"
                                value={formData.rfc} onChange={handleChange}
                                placeholder="Ej. VAZJ900101XYZ"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Nombre Completo*</label>
                            <input 
                                type="text" name="nombre_completo" required
                                className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500"
                                value={formData.nombre_completo} onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Teléfono</label>
                            <input 
                                type="tel" name="telefono"
                                className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500"
                                value={formData.telefono} onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Dirección</label>
                            <input 
                                type="text" name="direccion"
                                className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500"
                                value={formData.direccion} onChange={handleChange}
                            />
                        </div>
                    </div>
                    
                    <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded transition">
                            Cancelar
                        </button>
                        <button type="submit" disabled={cargando} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition disabled:opacity-50">
                            {cargando ? 'Guardando...' : (esEdicion ? 'Actualizar Cliente' : 'Registrar Cliente')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}