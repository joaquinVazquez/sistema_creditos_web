// src/components/Dashboard.jsx
import { useState, useEffect } from 'react';
import KpiCard from './KpiCard';

export default function Dashboard({ onLogout }) {
    // Estado para guardar los datos financieros cuando vengan del backend
    const [metricas, setMetricas] = useState({
        capital: 0,
        ingresos: 0,
        clientes: 0
    });

    return (
        <div className="min-h-screen bg-slate-100 flex flex-col">
            {/* Barra de Navegación Superior (Navbar) */}
            <header className="bg-white shadow-sm border-b border-slate-200 px-6 py-4 flex justify-between items-center">
                <div>
                    <h1 className="text-xl font-bold text-blue-800">FINAMI</h1>
                    <span className="text-xs text-slate-500">Panel de Control Operativo</span>
                </div>
                <button 
                    onClick={onLogout}
                    className="bg-slate-800 text-white px-4 py-2 rounded text-sm font-medium hover:bg-slate-700 transition"
                >
                    Cerrar Sesión
                </button>
            </header>

            {/* Área de Trabajo Principal */}
            <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
                
                {/* Cuadrícula de KPIs */}
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

                {/* Contenedor futuro para la Tabla de Clientes */}
                <div className="bg-white rounded-lg shadow-md border border-slate-200 p-6 min-h-[400px] flex items-center justify-center">
                    <p className="text-slate-400 italic">Aquí irá la tabla de clientes (Siguiente fase)</p>
                </div>

            </main>
        </div>
    );
}