"use client";

import { DashboardFilters } from "@/components/DashboardFilters";
import { TicketTable } from "@/components/TicketTable";
import { useTickets } from "@/hooks/useTickets";
import { createClient } from "@/utils/supabase/client";
import { useState } from "react";

export default function DashboardAgente() {
  const supabase = createClient();
  const { tickets, loading, updateStatus } = useTickets(supabase);
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

  if (loading) return <p className="text-center p-20 text-gray-400">Sincronizando...</p>;

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Panel de Control</h1>
          {totalPendientes > 0 && (
            <span className="bg-red-500 text-white px-4 py-1 rounded-full text-sm font-bold animate-pulse">
              {totalPendientes} pendientes
            </span>
          )}
        </header>

        <DashboardFilters 
          filtroActual={filtroPrioridad} 
          onFilterChange={setFiltroPrioridad} 
        />

        <TicketTable 
          tickets={ticketsFiltrados}
          actualizandoId={actualizandoId}
          onStatusChange={handleStatusChange}
          filtroPrioridad={filtroPrioridad}
        />
      </div>
    </main>
  );
}