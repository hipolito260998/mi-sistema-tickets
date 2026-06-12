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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
          <p className="text-muted-foreground font-black tracking-widest text-sm uppercase">Sincronizando tickets...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="flex-1 flex flex-col relative bg-background p-4 md:p-8 md:overflow-hidden overflow-y-auto">
      
      <div className="max-w-6xl mx-auto w-full h-full flex flex-col relative z-10">
        
        <header className="flex-shrink-0 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-black text-foreground tracking-tight flex items-center gap-3">
              Panel de Control
            </h1>
            <p className="text-muted-foreground text-sm font-medium mt-1">
              Gestión centralizada de incidentes técnicos.
            </p>
          </div>

          {tab === "tickets" && totalPendientes > 0 && (
            <Badge className="bg-rose-600 text-rose-50 px-5 py-2 rounded-full border border-rose-500/30 text-sm font-bold uppercase tracking-widest">
              {totalPendientes} pendientes
            </Badge>
          )}
        </header>

        {/* Tabs */}
        <div className="flex-shrink-0 mb-6 flex gap-4 border-b border-black/10 dark:border-white/10 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden w-full">
          <button
            onClick={() => setTab("tickets")}
            className={`px-4 py-3 font-bold text-sm transition-all border-b-2 relative ${
              tab === "tickets"
                ? "text-primary border-primary"
                : "text-muted-foreground border-transparent hover:text-foreground"
            }`}
          >
            🎫 Tickets
          </button>
          <button
            onClick={() => setTab("usuarios")}
            className={`px-4 py-3 font-bold text-sm transition-all border-b-2 relative ${
              tab === "usuarios"
                ? "text-primary border-primary"
                : "text-muted-foreground border-transparent hover:text-black dark:hover:text-white"
            }`}
          >
            👥 Usuarios
          </button>
        </div>

        {/* Tab Content */}
        {tab === "tickets" && (
          <>
            <section className="flex-shrink-0 mb-4 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden w-full pb-2">
              <DashboardFilters 
                filtroActual={filtroPrioridad} 
                onFilterChange={setFiltroPrioridad} 
              />
            </section>

            <section className="flex-1 overflow-hidden rounded-2xl shadow-xl border border-black/10 dark:border-white/10 bg-card dark:bg-background/50 backdrop-blur-sm relative flex flex-col min-h-[400px]">
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