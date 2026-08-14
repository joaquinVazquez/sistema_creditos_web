// src/components/PerfilCliente.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { obtenerClientePorRfc } from '../api/clienteService';
import { obtenerHistorialCreditos } from '../api/creditoService';
import NuevoCreditoModal from './NuevoCreditoModal';
import ModalEstadoCuenta from './ModalEstadoCuenta';

export default function PerfilCliente() {
    const { rfc } = useParams();
    const navigate = useNavigate();
    
    // Estados para la carga del cliente
    const [cliente, setCliente] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState('');

    // Estados para los créditos
    const [creditos, setCreditos] = useState([]);
    const [cargandoCreditos, setCargandoCreditos] = useState(false);
    const [mostrarModalCredito, setMostrarModalCredito] = useState(false);
    const [creditoSeleccionado, setCreditoSeleccionado] = useState(null);

    // useEffect 1: Carga los datos generales del cliente
    useEffect(() => {
        const cargarDatosCliente = async () => {
            try {
                setCargando(true);
                const datos = await obtenerClientePorRfc(rfc);
                if (Array.isArray(datos)) {
                    setCliente({
                        rfc: datos[0],
                        nombre_completo: datos[1],
                        telefono: datos[2] || 'N/A',
                        direccion: datos[3] || 'Sin dirección registrada'
                    });
                } else {
                    setCliente(datos);
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setCargando(false);
            }
        };
        cargarDatosCliente();
    }, [rfc]);

    // useEffect 2: Carga el historial de créditos (AHORA ESTÁ AFUERA DEL OTRO)
    const cargarCreditos = async () => {
        try {
            setCargandoCreditos(true);
            const datosCreditos = await obtenerHistorialCreditos(rfc);
            setCreditos(datosCreditos);
        } catch (err) {
            console.error(err);
        } finally {
            setCargandoCreditos(false);
        }
    };

    useEffect(() => {
        cargarCreditos();
    }, [rfc]);

    // Función de utilidad para renderizar dinero (MXN)
    const formatoMoneda = (cantidad) => {
        return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(cantidad);
    };

    if (cargando) {
        return (
            <div className="p-6 max-w-7xl mx-auto flex justify-center items-center h-64">
                <div className="text-slate-500 font-medium">Cargando expediente...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 max-w-7xl mx-auto">
                <button onClick={() => navigate('/')} className="mb-6 flex items-center text-slate-500 hover:text-blue-600 transition">
                    <span className="mr-2">←</span> Volver al Panel
                </button>
                <div className="bg-red-50 text-red-600 p-6 rounded-lg border border-red-200">
                    <h3 className="font-bold text-lg mb-2">Error de Lectura</h3>
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* Barra de Navegación Superior */}
            <button 
                onClick={() => navigate('/')} 
                className="flex items-center text-slate-500 hover:text-blue-600 font-medium transition"
            >
                <span className="mr-2">←</span> Volver al Panel Principal
            </button>
            
            {/* TARJETA 1: Información General del Cliente */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-slate-800 px-6 py-4 flex justify-between items-center">
                    <h2 className="text-white text-lg font-bold flex items-center gap-2">
                        <span>👤</span> Expediente del Cliente
                    </h2>
                    {cliente?.activo === false && (
                        <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded font-bold uppercase tracking-wider">
                            Archivado
                        </span>
                    )}
                </div>
                
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div>
                            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Nombre Completo</p>
                            <p className="text-slate-800 font-medium text-lg">{cliente?.nombre_completo}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">RFC</p>
                            <p className="text-slate-800 font-mono bg-slate-100 px-2 py-1 rounded inline-block">{cliente?.rfc}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Teléfono</p>
                            <p className="text-slate-800">{cliente?.telefono || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Dirección</p>
                            <p className="text-slate-800">{cliente?.direccion || 'N/A'}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* TARJETA 2: Módulo de Créditos (CON TABLA REAL) */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <span>💰</span> Historial Crediticio
                    </h3>
                    <button 
                        onClick={() => setMostrarModalCredito(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition"
                    >
                        + Nuevo Crédito
                    </button>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-100 text-slate-600 text-sm uppercase tracking-wider">
                                <th className="p-4 font-semibold border-b">ID</th>
                                <th className="p-4 font-semibold border-b">Fecha Emisión</th>
                                <th className="p-4 font-semibold border-b text-right">Monto</th>
                                <th className="p-4 font-semibold border-b text-center">Plazos</th>
                                <th className="p-4 font-semibold border-b text-right">Saldo Actual</th>
                                <th className="p-4 font-semibold border-b text-center">Estado</th>
                                <th className="p-4 font-semibold border-b text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm divide-y divide-slate-100">
                            {cargandoCreditos ? (
                                <tr><td colSpan="7" className="p-6 text-center text-slate-500">Cargando cuentas...</td></tr>
                            ) : creditos.length === 0 ? (
                                <tr><td colSpan="7" className="p-8 text-center text-slate-400 font-medium">No hay créditos activos registrados para este cliente.</td></tr>
                            ) : (
                                creditos.map((cred) => (
                                    <tr key={cred.id} className="hover:bg-slate-50 transition">
                                        <td className="p-4 text-slate-500 font-mono">#{cred.id}</td>
                                        <td className="p-4 text-slate-700">{new Date(cred.fecha_inicio).toLocaleDateString()}</td>
                                        <td className="p-4 font-medium text-slate-800 text-right">{formatoMoneda(cred.monto_original)}</td>
                                        <td className="p-4 text-slate-600 text-center">{cred.plazos_semanas} sem</td>
                                        <td className="p-4 font-bold text-blue-600 text-right">{formatoMoneda(cred.saldo_actual)}</td>
                                        <td className="p-4 text-center">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                                cred.estado === 'ACTIVO' ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-600'
                                            }`}>
                                                {cred.estado}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <button 
                                                onClick={() => setCreditoSeleccionado(cred)}
                                                className="text-blue-600 hover:text-blue-800 font-medium px-3 py-1 rounded border border-blue-200 hover:bg-blue-50 transition"
                                            >
                                                Ver Pagos
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* INSTANCIA DEL MODAL */}
            <NuevoCreditoModal 
                isOpen={mostrarModalCredito} 
                onClose={() => setMostrarModalCredito(false)} 
                rfcCliente={rfc} 
                onCreditoCreado={cargarCreditos}
            />

            <ModalEstadoCuenta 
                credito={creditoSeleccionado}
                onClose={() => setCreditoSeleccionado(null)}
                onPagoRealizado={cargarCreditos}
            />
            
        </div>
    );
}