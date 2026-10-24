// src/components/PerfilCliente.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { obtenerClientePorRfc, desarchivarCliente } from '../api/clienteService';
import { obtenerHistorialCreditos } from '../api/creditoService';
import NuevoCreditoModal from './NuevoCreditoModal';
import ModalEstadoCuenta from './ModalEstadoCuenta';
import NuevoClienteModal from './NuevoClienteModal'; 

export default function PerfilCliente() {
    const { rfc } = useParams();
    const navigate = useNavigate();
    
    // Estados para la carga del cliente
    const [cliente, setCliente] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState('');
    const [mostrarModalEdicion, setMostrarModalEdicion] = useState(false); 

    // Estados para los créditos
    const [creditos, setCreditos] = useState([]);
    const [cargandoCreditos, setCargandoCreditos] = useState(false);
    const [mostrarModalCredito, setMostrarModalCredito] = useState(false);
    const [creditoSeleccionado, setCreditoSeleccionado] = useState(null);

    const cargarDatosCliente = async () => {
        try {
            setCargando(true);
            const datos = await obtenerClientePorRfc(rfc);
            if (Array.isArray(datos)) {
                setCliente({
                    rfc: datos[0],
                    nombre_completo: datos[1],
                    telefono: datos[2] || 'N/A',
                    direccion: datos[3] || 'Sin dirección registrada',
                    activo: datos[4] 
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

    useEffect(() => {
        cargarDatosCliente();
    }, [rfc]);

    const handleClienteActualizado = (nuevoRfc) => {
        if (nuevoRfc && nuevoRfc !== rfc) {
            navigate(`/cliente/${nuevoRfc}`); 
        } else {
            cargarDatosCliente(); 
        }
    };

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

    const formatoMoneda = (cantidad) => {
        return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(cantidad);
    };

    // Función para corregir desfase de zona horaria
    const formatearFecha = (fechaString) => {
        if (!fechaString) return 'N/A';
        const fecha = new Date(fechaString.endsWith('Z') ? fechaString : `${fechaString}Z`);
        return fecha.toLocaleDateString(); 
    };

    // Función para desarchivar cliente
    const handleReactivar = async () => {
        const confirmar = window.confirm("¿Seguro que deseas reactivar este expediente?");
        if (!confirmar) return;

        try {
            await desarchivarCliente(cliente.rfc);
            cargarDatosCliente(); 
        } catch (err) {
            alert(err.message);
        }
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
            <button 
                onClick={() => navigate('/')} 
                className="flex items-center text-slate-500 hover:text-blue-600 font-medium transition"
            >
                <span className="mr-2">←</span> Volver al Panel Principal
            </button>
            
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-slate-800 px-6 py-4 flex justify-between items-center">
                    <h2 className="text-white text-lg font-bold flex items-center gap-2">
                        <span>👤</span> Expediente del Cliente
                    </h2>
                    
                    <div className="flex gap-2 items-center">
                        <button 
                            onClick={() => setMostrarModalEdicion(true)}
                            className="bg-slate-700 hover:bg-slate-600 text-white text-xs px-3 py-1.5 rounded font-medium transition flex items-center gap-1"
                        >
                            <span>✏️</span> Editar Datos
                        </button>
                        
                        {/* ESTE ES EL BOTÓN QUE FALTABA CONECTAR */}
                        {cliente?.activo === false && (
                            <button 
                                onClick={handleReactivar}
                                className="bg-orange-500 hover:bg-green-600 text-white text-xs px-2 py-1.5 rounded font-bold uppercase tracking-wider transition cursor-pointer"
                                title="Clic para reactivar el expediente"
                            >
                                Archivado (Reactivar)
                            </button>
                        )}
                    </div>
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
                                        <td className="p-4 text-slate-700">{formatearFecha(cred.fecha_inicio)}</td>
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

            <NuevoClienteModal 
                isOpen={mostrarModalEdicion} 
                onClose={() => setMostrarModalEdicion(false)} 
                onClienteCreado={handleClienteActualizado}
                clienteAEditar={cliente}
            />

            <NuevoCreditoModal 
                isOpen={mostrarModalCredito} 
                onClose={() => setMostrarModalCredito(false)} 
                clienteRfc={rfc} 
                onCreditoCreado={cargarCreditos}
            />

            <ModalEstadoCuenta 
                credito={creditoSeleccionado}
                cliente={cliente}
                onClose={() => setCreditoSeleccionado(null)}
                onPagoRealizado={cargarCreditos}
            />
            
        </div>
    );
}