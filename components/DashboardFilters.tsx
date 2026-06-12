"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface FilterProps {
  filtroActual: string;
  onFilterChange: (prioridad: string) => void;
}

export const DashboardFilters = ({ filtroActual, onFilterChange }: FilterProps) => {
  const opciones = [
    { id: "TODOS", label: "Ver Todo" },
    { id: "URGENT", label: "Urgente" },
    { id: "HIGH", label: "Alta" },
    { id: "MEDIUM", label: "Media" },
    { id: "LOW", label: "Baja" },
  ];

  return (
    // Agregamos self-end para que se alinee a la derecha si está en un flex-col
    // O simplemente mantenemos el mb-6 para separarlo de la tabla
    <div className="flex items-center gap-4 bg-background/60 p-1.5 rounded-2xl border border-black/10 dark:border-white/10 w-fit backdrop-blur-xl mb-2 shadow-sm">
      {/* Etiqueta elegante con más separación */}
      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-4 mr-1">
        Prioridad
      </span>

      <Tabs 
        value={filtroActual} 
        onValueChange={onFilterChange} 
        className="w-fit"
      >
        <TabsList className="bg-transparent space-x-1 h-9">
          {opciones.map((opcion) => (
            <TabsTrigger
              key={opcion.id}
              value={opcion.id}
              className={`
                px-4 py-1.5 rounded-xl text-[11px] font-bold transition-all duration-300
                data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:bg-black/5 dark:data-[state=inactive]:hover:bg-white/5
                data-[state=active]:text-white
                ${opcion.id === "URGENT" ? "data-[state=active]:bg-rose-600" : ""}
                ${opcion.id === "HIGH" ? "data-[state=active]:bg-orange-500" : ""}
                ${opcion.id === "MEDIUM" ? "data-[state=active]:bg-blue-600" : ""}
                ${opcion.id === "LOW" ? "data-[state=active]:bg-emerald-600" : ""}
                ${opcion.id === "TODOS" ? "data-[state=active]:bg-black/80 data-[state=active]:text-white dark:data-[state=active]:bg-white/20" : ""}
              `}
            >
              {opcion.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
};