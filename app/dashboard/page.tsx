"use client";

import { DashboardFilters } from "@/components/DashboardFilters";
import { TicketTable } from "@/components/TicketTable";
import { Badge } from "@/components/ui/badge";
import { useTickets } from "@/hooks/useTickets";
import { createClient } from "@/utils/supabase/client";
import { useState } from "react";

export default function DashboardAgente() {
  const supabase = createClient();
  const { tickets, loading, updateStatus,borrarTicket } = useTickets(supabase);
  const [filtroPrioridad, setFiltroPrioridad] = useState("TODOS");
  const [actualizandoId, setActualizandoId] = useState<string | null>(null);

  const ticketsFiltrados = tickets.filter((t) => 
    filtroPrioridad === "TODOS" ? true : t.priority === filtroPrioridad
  );

  const handleStatusChange = async (id: string, nuevoEstado: string) => {
    setActualizandoId(id);
    await updateStatus(id, nuevoEstado);
    setActualizandoId(null);
  };

  const totalPendientes = tickets.filter((t) => t.status === "OPEN").length;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-bold text-sm">Sincronizando tickets...</p>
        </div>
      </div>
    );
  }

  return (
    // 1. h-[calc(100vh-80px)] hace que la vista no sea más grande que tu monitor (80px es un aprox de tu Navbar)
    // 2. overflow-hidden bloquea el scroll de la ventana entera
    <main className="h-[calc(100vh-80px)] overflow-hidden bg-slate-50/50 p-4 md:p-8 flex flex-col">
      <div className="max-w-6xl mx-auto w-full h-full flex flex-col">
        
        {/* ENCABEZADO: flex-shrink-0 evita que se aplaste */}
        <header className="flex-shrink-0 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              Panel de Control
            </h1>
            <p className="text-slate-500 text-sm font-medium">
              Gestión centralizada de incidentes técnicos.
            </p>
          </div>

          {totalPendientes > 0 && (
            <Badge className="bg-red-500 hover:bg-red-600 text-white px-4 py-1.5 rounded-full shadow-lg shadow-red-200 animate-pulse border-none text-sm">
              {totalPendientes} tickets por atender
            </Badge>
          )}
        </header>

        {/* FILTROS: flex-shrink-0 evita que se aplasten. Ya no necesitan sticky. */}
        <section className="flex-shrink-0 mb-4">
          <DashboardFilters 
            filtroActual={filtroPrioridad} 
            onFilterChange={setFiltroPrioridad} 
          />
        </section>

        {/* CONTENEDOR TABLA: flex-1 le dice "ocupa todo el espacio que sobra hacia abajo" */}
        <section className="flex-1 overflow-hidden rounded-2xl shadow-xl border border-gray-200">
          <TicketTable 
            tickets={ticketsFiltrados}
            actualizandoId={actualizandoId}
            onStatusChange={handleStatusChange}
            filtroPrioridad={filtroPrioridad}
            onDelete={borrarTicket}
          />
        </section>
        
      </div>
    </main>
  );
}