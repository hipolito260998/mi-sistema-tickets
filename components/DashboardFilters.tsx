// components/DashboardFilters.tsx
interface FilterProps {
  filtroActual: string;
  onFilterChange: (prioridad: string) => void;
}

export const DashboardFilters = ({ filtroActual, onFilterChange }: FilterProps) => {
  const opciones = [
    { id: "TODOS", label: "Ver Todo", color: "bg-gray-800" },
    { id: "URGENT", label: "Urgente", color: "bg-red-600" },
    { id: "HIGH", label: "Alta", color: "bg-orange-500" },
    { id: "MEDIUM", label: "Media", color: "bg-blue-600" },
    { id: "LOW", label: "Baja", color: "bg-green-600" },
  ];

  return (
    <div className="flex items-center gap-3 mb-8 bg-white p-3 rounded-2xl shadow-sm border border-gray-200 w-fit">
      <span className="text-xs font-bold text-gray-400 uppercase ml-2 mr-2">Filtrar:</span>
      {opciones.map((boton) => (
        <button
          key={boton.id}
          onClick={() => onFilterChange(boton.id)}
          className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
            filtroActual === boton.id
              ? `${boton.color} text-white shadow-lg scale-105`
              : "bg-gray-50 text-gray-500 hover:bg-gray-200"
          }`}
        >
          {boton.label}
        </button>
      ))}
    </div>
  );
};