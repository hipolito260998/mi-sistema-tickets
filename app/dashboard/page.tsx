"use client";

import { DashboardFilters } from "@/components/DashboardFilters";
import { TicketTable } from "@/components/TicketTable";
import { UserManagement } from "@/components/UserManagement";
import { Badge } from "@/components/ui/badge";
import { useTickets } from "@/hooks/useTickets";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { Suspense, useState } from "react";

function DashboardAgenteContent() {
  const supabase = createClient();
  const router = useRouter();
  const { tickets, loading, updateStatus, borrarTicket } = useTickets(supabase);
  const [filtroPrioridad, setFiltroPrioridad] = useState("TODOS");
  const [actualizandoId, setActualizandoId] = useState<string | null>(null);
  const [tab, setTab] = useState<"tickets" | "usuarios">("tickets");

  const ticketsFiltrados = tickets.filter((t) => 
    filtroPrioridad === "TODOS" ? true : t.priority === filtroPrioridad
  );

  const handleStatusChange = async (id: string, nuevoEstado: string) => {
    setActualizandoId(id);
    await updateStatus(id, nuevoEstado);
    setActualizandoId(null);
  };

  const totalPendientes = tickets.filter((t) => t.status === "OPEN").length;

  if (loading && tab === "tickets") {
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
    <main className="h-[calc(100vh-80px)] overflow-hidden bg-slate-50/50 p-4 md:p-8 flex flex-col">
      <div className="max-w-6xl mx-auto w-full h-full flex flex-col">
        
        <header className="flex-shrink-0 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              Panel de Control
            </h1>
            <p className="text-slate-500 text-sm font-medium">
              Gestión centralizada de incidentes técnicos.
            </p>
          </div>

          {tab === "tickets" && totalPendientes > 0 && (
            <Badge className="bg-red-500 hover:bg-red-600 text-white px-4 py-1.5 rounded-full shadow-lg shadow-red-200 animate-pulse border-none text-sm">
              {totalPendientes} tickets por atender
            </Badge>
          )}
        </header>

        {/* Tabs */}
        <div className="flex-shrink-0 mb-4 flex gap-2 border-b border-slate-200">
          <button
            onClick={() => setTab("tickets")}
            className={`px-4 py-2 font-semibold text-sm transition-colors ${
              tab === "tickets"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            🎫 Tickets
          </button>
          <button
            onClick={() => setTab("usuarios")}
            className={`px-4 py-2 font-semibold text-sm transition-colors ${
              tab === "usuarios"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            👥 Usuarios
          </button>
        </div>

        {/* Tab Content */}
        {tab === "tickets" && (
          <>
            <section className="flex-shrink-0 mb-4">
              <DashboardFilters 
                filtroActual={filtroPrioridad} 
                onFilterChange={setFiltroPrioridad} 
              />
            </section>

            <section className="flex-1 overflow-hidden rounded-2xl shadow-xl border border-gray-200">
              <TicketTable 
                tickets={ticketsFiltrados}
                actualizandoId={actualizandoId}
                onStatusChange={handleStatusChange}
                filtroPrioridad={filtroPrioridad}
                onDelete={borrarTicket}
              />
            </section>
          </>
        )}

        {tab === "usuarios" && (
          <section className="flex-1 overflow-auto">
            <UserManagement supabase={supabase} />
          </section>
        )}
        
      </div>
    </main>
  );
}

export default function DashboardAgente() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="text-slate-500">Cargando...</div></div>}>
      <DashboardAgenteContent />
    </Suspense>
  );
}