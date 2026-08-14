// src/components/ModalEstadoCuenta.jsx
import { useState, useEffect } from 'react';
import { obtenerPagosPorCredito } from '../api/creditoService';
import { registrarAbono } from '../api/pagoService';

export default function ModalEstadoCuenta({ credito, onClose, onPagoRealizado }) {
    const [pagos, setPagos] = useState([]);
    const [cargandoPagos, setCargandoPagos] = useState(false);
    
    // Estados para el cobro
    const [monto, setMonto] = useState('');
    const [procesando, setProcesando] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (credito) {
            cargarHistorial();
            setMonto('');
            setError('');
        }
    }, [credito]);

    const cargarHistorial = async () => {
        setCargandoPagos(true);
        try {
            const datos = await obtenerPagosPorCredito(credito.id);
            setPagos(datos);
        } catch (err) {
            setError("No se pudo cargar el historial de recibos.");
        } finally {
            setCargandoPagos(false);
        }
    };

    const handleCobrar = async (e) => {
        e.preventDefault();
        if (!monto || isNaN(monto) || monto <= 0) {
            setError("Ingresa un monto válido mayor a $0.");
            return;
        }

        if (monto > credito.saldo_actual) {
            setError("El abono no puede ser mayor al saldo actual.");
            return;
        }

        setProcesando(true);
        setError('');
        
        try {
            await registrarAbono(credito.id, monto);
            setMonto('');
            cargarHistorial(); // 1. Refresca la tabla de pagos interna
            onPagoRealizado(); // 2. Le avisa al Expediente que baje el saldo general
        } catch (err) {
            setError(err.message);
        } finally {
            setProcesando(false);
        }
    };

    if (!credito) return null;

    const formatoMoneda = (cantidad) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(cantidad);

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
                
                {/* Cabecera */}
                <div className="bg-slate-800 px-6 py-4 flex justify-between items-center">
                    <div>
                        <h2 className="text-white text-lg font-bold">Estado de Cuenta | Crédito #{credito.id}</h2>
                        <p className="text-slate-300 text-sm">Saldo Actual: <span className="font-bold text-green-400">{formatoMoneda(credito.saldo_actual)}</span></p>
                    </div>
                    <button onClick={onClose} className="text-slate-300 hover:text-white font-bold text-xl">✕</button>
                </div>

                <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
                    
                    {/* Panel Izquierdo: Formulario de Cobro */}
                    <div className="md:w-1/3 p-6 bg-slate-50 border-r border-slate-200">
                        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <span>💵</span> Registrar Abono
                        </h3>
                        
                        {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm border border-red-200">{error}</div>}
                        
                        <form onSubmit={handleCobrar} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Monto Recibido ($)</label>
                                <input 
                                    type="number" step="0.01" min="1" required
                                    className="w-full p-2 text-lg font-bold border border-slate-300 rounded focus:ring-2 focus:ring-green-500 text-slate-800"
                                    value={monto} 
                                    onChange={(e) => setMonto(e.target.value)}
                                    placeholder="0.00"
                                    disabled={credito.estado !== 'ACTIVO'}
                                />
                            </div>
                            <button 
                                type="submit" 
                                disabled={procesando || credito.estado !== 'ACTIVO'} 
                                className="w-full bg-green-600 text-white py-3 rounded font-bold hover:bg-green-700 transition disabled:opacity-50"
                            >
                                {procesando ? 'Procesando...' : 'Cobrar Abono'}
                            </button>
                            {credito.estado !== 'ACTIVO' && (
                                <p className="text-xs text-orange-600 text-center font-medium mt-2">
                                    Este crédito ya no está activo.
                                </p>
                            )}
                        </form>
                    </div>

                    {/* Panel Derecho: Historial de Pagos */}
                    <div className="md:w-2/3 p-6 overflow-y-auto">
                        <h3 className="font-bold text-slate-800 mb-4">Historial de Recibos</h3>
                        
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-100 text-slate-600 text-xs uppercase tracking-wider">
                                    <th className="p-3 border-b">Folio</th>
                                    <th className="p-3 border-b">Fecha</th>
                                    <th className="p-3 border-b">Cajero</th>
                                    <th className="p-3 border-b text-right">Abono</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm divide-y divide-slate-100">
                                {cargandoPagos ? (
                                    <tr><td colSpan="4" className="p-4 text-center text-slate-500">Cargando recibos...</td></tr>
                                ) : pagos.length === 0 ? (
                                    <tr><td colSpan="4" className="p-8 text-center text-slate-400">Aún no se han registrado pagos.</td></tr>
                                ) : (
                                    pagos.map((pago) => (
                                        <tr key={pago.id} className="hover:bg-slate-50">
                                            <td className="p-3 font-mono text-slate-500 text-xs">#{pago.id}</td>
                                            <td className="p-3 text-slate-700">{new Date(pago.fecha).toLocaleString()}</td>
                                            <td className="p-3 text-slate-600">{pago.username}</td>
                                            <td className="p-3 font-bold text-green-600 text-right">+{formatoMoneda(pago.monto)}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}