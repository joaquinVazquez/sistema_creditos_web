// src/components/Dashboard.jsx
import { useState, useEffect } from 'react';
import KpiCard from './KpiCard';
import CorteCajaModal from './CorteCajaModal'; // NUEVO: Importación del reporte
import { obtenerMetricasDashboard } from '../api/dashboardService';

export default function Dashboard({ onLogout }) {
    const [metricas, setMetricas] = useState({ capital: 0, ingresos: 0, clientes: 0 });
    const [cargando, setCargando] = useState(true);
    const [mostrarCorte, setMostrarCorte] = useState(false); // NUEVO: Control de visibilidad del reporte

    useEffect(() => {
        const cargarDatos = async () => {
            try {
                const datos = await obtenerMetricasDashboard();
                setMetricas({
                    capital: datos.capital_activo || 0,
                    ingresos: datos.ingresos_hoy || 0,
                    clientes: datos.clientes_activos || 0
                });
            } catch (error) {
                console.error("Fallo al cargar indicadores operativos");
            } finally {
                setCargando(false);
            }
        };
        cargarDatos();
    }, []);

    if (cargando) {
        return <div className="min-h-screen bg-slate-100 flex items-center justify-center font-bold text-slate-500">Generando panel operativo...</div>;
    }

    return (
        <div className="min-h-screen bg-slate-100 flex flex-col">
            <header className="bg-white shadow-sm border-b border-slate-200 px-6 py-4 flex justify-between items-center">
                <div>
                    <h1 className="text-xl font-bold text-blue-800">FINAMI</h1>
                    <span className="text-xs text-slate-500">Panel de Control Operativo</span>
                </div>
                
                {/* NUEVO: Contenedor de botones de acción */}
                <div className="flex gap-3">
                    <button 
                        onClick={() => setMostrarCorte(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700 transition shadow-sm"
                    >
                        Generar Corte de Caja
                    </button>
                    <button 
                        onClick={onLogout}
                        className="bg-slate-800 text-white px-4 py-2 rounded text-sm font-medium hover:bg-slate-700 transition shadow-sm"
                    >
                        Cerrar Sesión
                    </button>
                </div>
            </header>

            <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <KpiCard 
                        titulo="Capital en Calle" 
                        valor={`$${metricas.capital.toLocaleString('es-MX', {minimumFractionDigits: 2})}`} 
                        colorBorder="border-blue-500" 
                        colorTexto="text-blue-600"
                    />
                    <KpiCard 
                        titulo="Ingresos Hoy" 
                        valor={`$${metricas.ingresos.toLocaleString('es-MX', {minimumFractionDigits: 2})}`} 
                        colorBorder="border-green-500" 
                        colorTexto="text-green-600"
                    />
                    <KpiCard 
                        titulo="Clientes Activos" 
                        valor={metricas.clientes} 
                        colorBorder="border-purple-500" 
                        colorTexto="text-purple-600"
                    />
                </div>

                <div className="bg-white rounded-lg shadow-md border border-slate-200 p-6 min-h-[400px] flex items-center justify-center">
                    <p className="text-slate-400 italic">Aquí irá el directorio de clientes (Siguiente fase)</p>
                </div>
            </main>

            {/* NUEVO: Instancia del reporte financiero */}
            <CorteCajaModal 
                isOpen={mostrarCorte} 
                onClose={() => setMostrarCorte(false)} 
            />
        </div>
    );
}