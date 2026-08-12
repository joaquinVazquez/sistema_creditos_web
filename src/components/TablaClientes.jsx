import { useState, useEffect } from 'react';
import { obtenerClientes, archivarCliente } from '../api/clienteService';
import NuevoClienteModal from './NuevoClienteModal';
import { useNavigate } from 'react-router-dom';

export default function TablaClientes() {
    const navigate = useNavigate();
    const [clientes, setClientes] = useState([]);
    const [busqueda, setBusqueda] = useState('');
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState('');
    const [mostrarModal, setMostrarModal] = useState(false);
    
    // Estado del interruptor
    const [mostrarArchivados, setMostrarArchivados] = useState(false);

    const cargarDatos = async () => {
        setCargando(true);
        try {
            const datos = await obtenerClientes(mostrarArchivados);
            setClientes(datos);
        } catch (err) {
            setError('No se pudo cargar el directorio de clientes.');
        } finally {
            setCargando(false);
        }
    };

    // Recargar datos cuando el switch cambia
    useEffect(() => {
        cargarDatos();
    }, [mostrarArchivados]);

    const handleArchivar = async (rfc) => {
        if (window.confirm(`¿Estás seguro de archivar al cliente con RFC: ${rfc}?`)) {
            try {
                await archivarCliente(rfc);
                cargarDatos(); 
            } catch (err) {
                alert(err.message);
            }
        }
    };

    const clientesFiltrados = clientes.filter(cliente => 
        (cliente.nombre_completo && cliente.nombre_completo.toLowerCase().includes(busqueda.toLowerCase())) ||
        (cliente.rfc && cliente.rfc.toLowerCase().includes(busqueda.toLowerCase()))
    );

    return (
        <div className="bg-white rounded-lg shadow-md border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col md:flex-row justify-between items-center gap-4">
                
                <div className="flex flex-wrap items-center gap-6 w-full md:w-auto">
                    <h2 className="text-lg font-bold text-slate-800">Directorio de Clientes</h2>
                    
                    {/* SWITCH DE ARCHIVADOS */}
                    <label className="flex items-center cursor-pointer">
                        <div className="relative">
                            <input 
                                type="checkbox" 
                                className="sr-only" 
                                checked={mostrarArchivados}
                                onChange={() => setMostrarArchivados(!mostrarArchivados)}
                            />
                            <div className={`block w-10 h-6 rounded-full transition ${mostrarArchivados ? 'bg-blue-600' : 'bg-slate-300'}`}></div>
                            <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition ${mostrarArchivados ? 'transform translate-x-4' : ''}`}></div>
                        </div>
                        <span className="ml-3 text-sm font-medium text-slate-600">
                            Mostrar archivados
                        </span>
                    </label>
                </div>
                
                <div className="flex gap-3 w-full md:w-auto mt-2 md:mt-0">
                    <input 
                        type="text" 
                        placeholder="Buscar por nombre o RFC..." 
                        className="pl-3 pr-4 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1 md:w-64"
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                    />
                    <button 
                        onClick={() => setMostrarModal(true)}
                        className="bg-slate-800 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-slate-700 transition whitespace-nowrap"
                    >
                        + Nuevo
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-100 text-slate-600 text-sm uppercase tracking-wider">
                            <th className="p-4 font-semibold border-b">ID / RFC</th>
                            <th className="p-4 font-semibold border-b">Nombre Completo</th>
                            <th className="p-4 font-semibold border-b">Teléfono</th>
                            <th className="p-4 font-semibold border-b text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm divide-y divide-slate-100">
                        {cargando ? (
                            <tr><td colSpan="4" className="p-6 text-center text-slate-500">Cargando directorio...</td></tr>
                        ) : error ? (
                            <tr><td colSpan="4" className="p-6 text-center text-red-500">{error}</td></tr>
                        ) : clientesFiltrados.length === 0 ? (
                            <tr><td colSpan="4" className="p-6 text-center text-slate-500">No se encontraron clientes.</td></tr>
                        ) : (
                            clientesFiltrados.map((cliente) => (
                                <tr key={cliente.rfc} className={`hover:bg-slate-50 transition ${!cliente.activo ? 'bg-slate-50/50' : ''}`}>
                                    <td className="p-4 text-slate-500 font-mono text-xs">{cliente.rfc}</td>
                                    
                                    <td className="p-4 font-medium text-slate-800 flex items-center gap-2">
                                        {cliente.nombre_completo}
                                        {!cliente.activo && (
                                            <span className="px-2 py-0.5 text-xs font-semibold bg-slate-200 text-slate-600 rounded-full">
                                                Archivado
                                            </span>
                                        )}
                                    </td>
                                    
                                    <td className="p-4 text-slate-600">{cliente.telefono || 'N/A'}</td>
                                    
                                    <td className="p-4 text-right flex justify-end gap-2">
                                        <button 
                                            onClick={() => navigate(`/cliente/${cliente.rfc}`)}
                                            className="text-blue-600 hover:text-blue-800 font-medium px-2 py-1 rounded bg-blue-50 hover:bg-blue-100 transition">
                                            Ver Perfil
                                        </button>
                                        
                                        {cliente.activo && (
                                            <button 
                                                onClick={() => handleArchivar(cliente.rfc)}
                                                className="text-orange-600 hover:text-orange-800 font-medium px-2 py-1 rounded bg-orange-50 hover:bg-orange-100 transition"
                                                title="Archivar registro"
                                            >
                                                Archivar
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <NuevoClienteModal 
                isOpen={mostrarModal} 
                onClose={() => setMostrarModal(false)}
                onClienteCreado={cargarDatos} 
            />
        </div>
    );
}