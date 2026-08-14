// src/components/NuevoCreditoModal.jsx
import { useState, useMemo } from 'react';
import { crearCredito } from '../api/creditoService';

export default function NuevoCreditoModal({ isOpen, onClose, onCreditoCreado, clienteRfc }) {
    const [monto, setMonto] = useState('');
    const [tasa, setTasa] = useState('10'); // Valor por defecto común
    const [plazos, setPlazos] = useState('12');
    const [procesando, setProcesando] = useState(false);

    // UX: Cálculo en tiempo real (Feedback inmediato)
    const calculos = useMemo(() => {
        const m = parseFloat(monto) || 0;
        const t = parseFloat(tasa) || 0;
        const p = parseFloat(plazos) || 1;
        
        const interes = m * (t / 100);
        const total = m + interes;
        const pagoSemanal = total / p;
        
        return { total, pagoSemanal };
    }, [monto, tasa, plazos]);

    const handleImprimirTicket = (datosCredito) => {
        const ticketWindow = window.open('', '_blank', 'width=400,height=600');
        ticketWindow.document.write(`
            <html>
            <head><style>
                body { font-family: 'Courier New', Courier, monospace; width: 72mm; margin: 0 auto; font-size: 14px; }
                .text-center { text-align: center; }
                .flex-between { display: flex; justify-content: space-between; margin-bottom: 5px; }
                .header { font-size: 18px; font-weight: bold; margin-bottom: 10px; }
                .divider { border-top: 1px dashed #000; margin: 10px 0; }
            </style></head>
            <body>
                <div class="text-center">
                    <div class="header">CONTRATO DE CRÉDITO</div>
                    <div>${new Date().toLocaleDateString()}</div>
                </div>
                <div class="divider"></div>
                <div class="flex-between"><span>Cliente (RFC):</span> <span>${clienteRfc}</span></div>
                <div class="divider"></div>
                <div class="flex-between"><span>Monto Préstamo:</span> <span>$${parseFloat(monto).toFixed(2)}</span></div>
                <div class="flex-between"><span>Tasa Interés:</span> <span>${tasa}%</span></div>
                <div class="flex-between"><span>Plazos:</span> <span>${plazos} semanas</span></div>
                <div class="divider"></div>
                <div class="flex-between" style="font-size: 16px; font-weight: bold;"><span>PAGO SEMANAL:</span> <span>$${calculos.pagoSemanal.toFixed(2)}</span></div>
                <div class="flex-between"><span>Total a Pagar:</span> <span>$${calculos.total.toFixed(2)}</span></div>
                <div class="divider"></div>
                <div class="text-center" style="margin-top:20px; font-size: 12px;">
                    __________________________<br/>Firma de Conformidad
                </div>
                <script>window.onload = () => { window.print(); window.close(); }</script>
            </body>
            </html>
        `);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setProcesando(true);
        try {
            await crearCredito({
                rfc_cliente: clienteRfc,
                monto: parseFloat(monto),
                tasa_global: parseFloat(tasa),
                plazos_semanas: parseInt(plazos)
            });
            
            handleImprimirTicket(); // Generar ticket al éxito
            onCreditoCreado();
            onClose();
        } catch (err) {
            alert(err.message);
        } finally {
            setProcesando(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
                <h2 className="text-xl font-bold mb-4">Otorgar Nuevo Crédito</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium">Monto del Préstamo ($)</label>
                        <input type="number" required className="w-full p-2 border rounded" value={monto} onChange={(e) => setMonto(e.target.value)} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium">Tasa Global (%)</label>
                            <input type="number" required className="w-full p-2 border rounded" value={tasa} onChange={(e) => setTasa(e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Semanas</label>
                            <input type="number" required className="w-full p-2 border rounded" value={plazos} onChange={(e) => setPlazos(e.target.value)} />
                        </div>
                    </div>
                    
                    {/* Panel de Resumen (UX) */}
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <div className="flex justify-between text-blue-800">
                            <span>Cuota Semanal:</span>
                            <span className="font-bold text-lg">${calculos.pagoSemanal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-blue-600 text-sm mt-1">
                            <span>Total a pagar:</span>
                            <span>${calculos.total.toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 py-2 bg-slate-200 rounded">Cancelar</button>
                        <button type="submit" disabled={procesando} className="flex-1 py-2 bg-green-600 text-white rounded font-bold hover:bg-green-700">
                            {procesando ? 'Guardando...' : 'Otorgar Crédito'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}