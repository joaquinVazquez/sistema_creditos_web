// src/components/KpiCard.jsx
export default function KpiCard({ titulo, valor, colorBorder, colorTexto }) {
    return (
        <div className={`bg-white border-l-4 ${colorBorder} rounded-lg shadow-md p-5 flex flex-col`}>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {titulo}
            </span>
            <span className={`text-2xl font-bold mt-2 ${colorTexto}`}>
                {valor}
            </span>
        </div>
    );
}