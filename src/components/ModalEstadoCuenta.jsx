// src/components/ModalEstadoCuenta.jsx
import { useState, useEffect } from 'react';
import { obtenerPagosPorCredito, obtenerMetricasCredito } from '../api/creditoService';
import { registrarAbono, revertirAbono } from '../api/pagoService';

export default function ModalEstadoCuenta({ credito, onClose, onPagoRealizado }) {
    const [pagos, setPagos] = useState([]);
    const [metrica, setMetrica] = useState(null);
    const [cargandoPagos, setCargandoPagos] = useState(false);
    
    // Estados para el cobro y ticket
    const [monto, setMonto] = useState('');
    const [procesando, setProcesando] = useState(false);
    const [error, setError] = useState('');
    const [ultimoTicket, setUltimoTicket] = useState(null);

    useEffect(() => {
        if (credito) {
            cargarDatosIniciales();
            setUltimoTicket(null);
            setMonto('');
            setError('');
        }
    }, [credito]);

    const cargarDatosIniciales = async () => {
        setCargandoPagos(true);
        try {
            const [datosPagos, datosMetricas] = await Promise.all([
                obtenerPagosPorCredito(credito.id),
                obtenerMetricasCredito(credito.id)
            ]);
            setPagos(datosPagos);
            setMetrica(datosMetricas);
            
            // UX: Sugerimos la cuota automáticamente
            if (datosMetricas?.cuota_semanal) {
                setMonto(datosMetricas.cuota_semanal.toFixed(2));
            }
        } catch (err) {
            setError("No se pudo cargar la información del crédito.");
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

        const montoNumerico = parseFloat(monto);
        if (montoNumerico > credito.saldo_actual) {
            setError("El abono no puede ser mayor al saldo actual.");
            return;
        }

        setProcesando(true);
        setError('');
        const saldoAnterior = credito.saldo_actual;

        try {
            await registrarAbono(credito.id, montoNumerico);
            
            // Construimos el ticket para el operador
            setUltimoTicket({
                fecha: new Date().toLocaleString(),
                creditoId: credito.id,
                saldoAnterior: saldoAnterior,
                montoAbonado: montoNumerico,
                saldoNuevo: saldoAnterior - montoNumerico
            });

            cargarDatosIniciales(); 
            onPagoRealizado(); 
        } catch (err) {
            setError(err.message);
        } finally {
            setProcesando(false);
        }
    };

    // UX Segura: Confirmación antes de revertir
    const handleRevertir = async (pagoId) => {
        const confirmar = window.confirm("¿Seguro que deseas cancelar este abono? El dinero se regresará al saldo del cliente.");
        if (!confirmar) return;

        try {
            setError('');
            await revertirAbono(pagoId);
            cargarDatosIniciales();
            onPagoRealizado();
            setUltimoTicket(null); // Ocultar ticket si existía
        } catch (err) {
            setError(err.message);
        }
    };

    const formatoMoneda = (cantidad) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(cantidad);

    // Función exclusiva para impresoras térmicas de 80mm
    const imprimirTicketTermico = () => {
        if (!ultimoTicket) return;

        // Abrimos una ventana temporal invisible
        const ticketWindow = window.open('', '_blank', 'width=400,height=600');
        
        // Inyectamos HTML diseñado estrictamente para rollos de 80mm
        ticketWindow.document.write(`
            <html>
            <head>
                <title>Ticket de Abono</title>
                <style>
                    /* Reset de márgenes para miniprinters */
                    @page { margin: 0; }
                    body { 
                        font-family: 'Courier New', Courier, monospace;
                        width: 72mm; /* Dejamos 8mm de margen de seguridad para el rodillo */
                        margin: 0 auto; 
                        padding: 5mm; 
                        color: #000;
                        font-size: 14px;
                    }
                    .text-center { text-align: center; }
                    .flex-between { display: flex; justify-content: space-between; margin-bottom: 4px; }
                    .font-bold { font-weight: bold; }
                    .divider { border-top: 1px dashed #000; margin: 10px 0; }
                    .header { font-size: 16px; font-weight: bold; margin-bottom: 5px; }
                </style>
            </head>
            <body>
                <div class="text-center">
                    <div class="header">COMPROBANTE DE PAGO</div>
                    <div style="font-size: 12px;">Fecha: ${ultimoTicket.fecha}</div>
                </div>
                
                <div class="divider"></div>
                
                <div class="flex-between">
                    <span>Crédito:</span>
                    <span>#${ultimoTicket.creditoId}</span>
                </div>
                <div class="flex-between">
                    <span>Saldo Ant:</span>
                    <span>${formatoMoneda(ultimoTicket.saldoAnterior)}</span>
                </div>
                
                <div class="divider"></div>
                
                <div class="flex-between font-bold" style="font-size: 16px;">
                    <span>ABONO:</span>
                    <span>${formatoMoneda(ultimoTicket.montoAbonado)}</span>
                </div>
                
                <div class="divider"></div>
                
                <div class="flex-between font-bold">
                    <span>Nuevo Saldo:</span>
                    <span>${formatoMoneda(ultimoTicket.saldoNuevo)}</span>
                </div>
                
                <br/>
                <div class="text-center" style="font-size: 12px;">
                    ¡Gracias por su pago!<br/>
                    Conserve este ticket para cualquier aclaración.
                </div>

                <script>
                    window.onload = () => { 
                        window.print(); 
                        setTimeout(() => window.close(), 500);
                    }
                </script>
            </body>
            </html>
        `);
        ticketWindow.document.close();
    };

    if (!credito) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[95vh]">
                
                {/* Cabecera */}
                <div className="bg-slate-800 px-6 py-4 flex justify-between items-center">
                    <div>
                        <h2 className="text-white text-lg font-bold">Estado de Cuenta | Crédito #{credito.id}</h2>
                        <p className="text-slate-300 text-sm">
                            Saldo Actual: <span className="font-bold text-green-400">{formatoMoneda(credito.saldo_actual)}</span> 
                            {metrica && <span className="ml-4 text-xs bg-slate-700 px-2 py-1 rounded">Semana {metrica.semana_actual}</span>}
                        </p>
                    </div>
                    <button onClick={onClose} className="text-slate-300 hover:text-white font-bold text-xl">✕</button>
                </div>

                <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
                    
                    {/* Panel Izquierdo: Formulario de Cobro / Ticket */}
                    <div className="md:w-1/3 p-6 bg-slate-50 border-r border-slate-200 overflow-y-auto">
                        
                        {ultimoTicket ? (
                            /* VISTA DE TICKET EXITOSO */
                            <div className="bg-white p-4 rounded-lg border border-dashed border-slate-300 shadow-sm space-y-3">
                                <div className="text-center border-b border-slate-100 pb-2">
                                    <span className="text-xl">🖨️</span>
                                    <h4 className="font-bold text-slate-800 text-sm">Comprobante de Abono</h4>
                                    <p className="text-xs text-slate-400">{ultimoTicket.fecha}</p>
                                </div>
                                <div className="text-xs space-y-1 text-slate-600">
                                    <div className="flex justify-between"><span>Crédito:</span> <span className="font-mono">#{ultimoTicket.creditoId}</span></div>
                                    <div className="flex justify-between"><span>Saldo Anterior:</span> <span>{formatoMoneda(ultimoTicket.saldoAnterior)}</span></div>
                                    <div className="flex justify-between font-bold text-green-600 text-sm border-y border-slate-100 py-1">
                                        <span>Abono Recibido:</span> <span>{formatoMoneda(ultimoTicket.montoAbonado)}</span>
                                    </div>
                                    <div className="flex justify-between font-bold text-slate-800"><span>Nuevo Saldo:</span> <span>{formatoMoneda(ultimoTicket.saldoNuevo)}</span></div>
                                </div>
                                <div className="pt-2 flex gap-2">
                                    <button 
                                        onClick={imprimirTicketTermico} 
                                        className="flex-1 bg-slate-800 text-white text-xs py-2 rounded font-medium hover:bg-slate-700 transition"
                                    >
                                        Imprimir Ticket
                                    </button>
                                    <button 
                                        onClick={() => setUltimoTicket(null)} 
                                        className="flex-1 bg-blue-50 text-blue-600 text-xs py-2 rounded font-medium hover:bg-blue-100 transition"
                                    >
                                        Nuevo Cobro
                                    </button>
                                </div>
                            </div>
                        ) : (
                            /* FORMULARIO DE COBRO NORMAL */
                            <div>
                                <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                                    <span>💵</span> Registrar Abono
                                </h3>

                                {metrica && (
                                    <div className="mb-4 bg-blue-50 border border-blue-200 p-3 rounded text-xs text-blue-800">
                                        <p className="font-semibold">Cuota Semanal Recomendada:</p>
                                        <div className="flex justify-between items-center mt-1">
                                            <span className="text-base font-bold">{formatoMoneda(metrica.cuota_semanal)}</span>
                                            <button 
                                                type="button"
                                                onClick={() => setMonto(metrica.cuota_semanal.toFixed(2))}
                                                className="bg-blue-600 text-white px-2 py-1 rounded text-[10px] hover:bg-blue-700 transition"
                                            >
                                                Usar Cuota
                                            </button>
                                        </div>
                                    </div>
                                )}
                                
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
                                        className="w-full bg-green-600 text-white py-3 rounded font-bold hover:bg-green-700 transition disabled:opacity-50 shadow-sm"
                                    >
                                        {procesando ? 'Procesando...' : 'Cobrar y Generar Ticket'}
                                    </button>
                                    {credito.estado !== 'ACTIVO' && (
                                        <p className="text-xs text-orange-600 text-center font-medium mt-2">
                                            Este crédito ya no está activo.
                                        </p>
                                    )}
                                </form>
                            </div>
                        )}
                    </div>

                    {/* Panel Derecho: Historial de Recibos */}
                    <div className="md:w-2/3 p-6 overflow-y-auto">
                        <h3 className="font-bold text-slate-800 mb-4">Historial de Recibos</h3>
                        
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-100 text-slate-600 text-xs uppercase tracking-wider">
                                    <th className="p-3 border-b">Folio</th>
                                    <th className="p-3 border-b">Fecha</th>
                                    <th className="p-3 border-b">Cajero</th>
                                    <th className="p-3 border-b text-right">Abono</th>
                                    <th className="p-3 border-b text-center">Acción</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm divide-y divide-slate-100">
                                {cargandoPagos ? (
                                    <tr><td colSpan="5" className="p-4 text-center text-slate-500">Cargando recibos...</td></tr>
                                ) : pagos.length === 0 ? (
                                    <tr><td colSpan="5" className="p-8 text-center text-slate-400">Aún no se han registrado pagos.</td></tr>
                                ) : (
                                    pagos.map((pago) => (
                                        <tr key={pago.id} className="hover:bg-slate-50">
                                            <td className="p-3 font-mono text-slate-500 text-xs">#{pago.id}</td>
                                            <td className="p-3 text-slate-700">{new Date(pago.fecha).toLocaleString()}</td>
                                            <td className="p-3 text-slate-600">{pago.username}</td>
                                            <td className="p-3 font-bold text-green-600 text-right">+{formatoMoneda(pago.monto)}</td>
                                            <td className="p-3 text-center">
                                                <button 
                                                    onClick={() => handleRevertir(pago.id)}
                                                    className="text-red-500 hover:text-red-700 text-xs font-medium px-2 py-1 bg-red-50 rounded hover:bg-red-100 transition"
                                                    title="Cancelar este abono"
                                                >
                                                    Cancelar
                                                </button>
                                            </td>
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