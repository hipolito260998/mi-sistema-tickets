"use client";

import { Badge } from "@/components/ui/badge";
import { Ticket } from "@/types/ticket";
import { AlertCircle, CheckCircle2, Inbox } from "lucide-react";

interface TicketListProps {
  tickets: Ticket[];
  loading: boolean;
}

export const TicketList = ({ tickets, loading }: TicketListProps) => {
  const activos = tickets.filter(
    (t) => t.status === "OPEN" || t.status === "IN_PROGRESS",
  );
  const finalizados = tickets.filter(
    (t) => t.status === "RESOLVED" || t.status === "CLOSED",
  );

  return (
    <div className="flex flex-col h-full gap-8">
      {/* ======================================= */}
      {/* CAJA 1: SOLICITUDES EN CURSO */}
      {/* ======================================= */}
      <section className="flex flex-col flex-1 min-h-0 relative overflow-hidden md:overflow-visible">
        {/* Glow de fondo */}
        <div className="absolute top-1/4 -right-12 w-64 h-64 bg-primary/10 blur-[80px] pointer-events-none rounded-full" />
        
        {/* Encabezado */}
        <div className="flex-shrink-0 flex items-center justify-between mb-6 px-2 relative z-10">
          <h2 className="text-xl md:text-2xl font-black text-foreground flex items-center gap-3 tracking-tight">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
            </span>
            En Curso
          </h2>
          <Badge
            variant="outline"
            className="text-primary border-primary/30 bg-primary/10 px-4 py-1 rounded-full font-bold"
          >
            {activos.length} activos
          </Badge>
        </div>

        {/* Área de Scroll de Activos */}
        <div className="flex-1 overflow-y-auto pr-2 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden space-y-4 relative z-10">
          {loading ? (
            <div className="h-32 w-full bg-black/5 dark:bg-white/5 animate-pulse rounded-2xl border border-black/10 dark:border-white/10" />
          ) : activos.length === 0 ? (
            <div className="bg-card dark:bg-background/40 backdrop-blur-md p-12 rounded-3xl border border-dashed border-black/10 dark:border-white/10 text-center h-full flex flex-col justify-center transition-all hover:bg-black/5 dark:hover:bg-white/5 shadow-sm">
              <div className="w-16 h-16 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center mx-auto mb-4 border border-black/10 dark:border-white/10">
                <Inbox className="text-muted-foreground" size={28} />
              </div>
              <p className="text-muted-foreground font-medium">
                No tienes incidencias activas. ¡Todo funciona perfecto!
              </p>
            </div>
          ) : (
            activos.map((ticket) => (
              <div
                key={ticket.id}
                className="group bg-card dark:bg-background/60 backdrop-blur-md p-5 rounded-2xl shadow-sm border border-black/5 dark:border-white/5 border-l-4 border-l-primary flex flex-col md:flex-row md:items-center gap-4 justify-between hover:bg-black/5 dark:hover:bg-white/5 hover:border-black/10 dark:hover:border-white/10 hover:shadow-md transition-all duration-300 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="space-y-2.5 flex-1 relative z-10">
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-foreground text-lg tracking-tight group-hover:text-primary transition-colors">{ticket.title}</h3>
                    {ticket.priority === "URGENT" && (
                      <Badge className="bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 border-none font-bold text-[9px] px-2 py-0 animate-pulse">
                        <AlertCircle size={10} className="mr-1 inline" /> URGENTE
                      </Badge>
                    )}
                  </div>

                  {ticket.profiles && (
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground">
                        <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-foreground font-black text-[9px]">
                          {Array.isArray(ticket.profiles) 
                            ? ticket.profiles[0]?.first_name?.charAt(0) || "U"
                            : ticket.profiles.first_name?.charAt(0) || "U"}
                        </div>
                        {Array.isArray(ticket.profiles)
                          ? `${ticket.profiles[0]?.first_name} ${ticket.profiles[0]?.last_name}`
                          : `${ticket.profiles.first_name} ${ticket.profiles.last_name}`}
                      </div>
                      {ticket.area && (
                        <div className="px-2 py-0.5 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-muted-foreground text-[9px] font-black rounded-md uppercase tracking-widest">
                          {ticket.area}
                        </div>
                      )}
                    </div>
                  )}

                  <p className="text-[10px] text-white/30 font-mono tracking-wider uppercase">
                    ID: {ticket.id.substring(0, 8)} <span className="mx-2 opacity-50">•</span> {new Date(ticket.created_at).toLocaleDateString()}
                  </p>
                </div>

                <div className="relative z-10 self-start md:self-center">
                  <Badge
                    className={`rounded-full px-4 py-1.5 font-black text-[10px] uppercase tracking-widest ${
                      ticket.status === "OPEN"
                        ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                        : "bg-blue-500/10 text-blue-400 border border-blue-500/30"
                    }`}
                  >
                    {ticket.status === "OPEN" ? "Abierto" : "Procesando"}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* ======================================= */}
      {/* CAJA 2: HISTORIAL RESUELTO */}
      {/* ======================================= */}
      {finalizados.length > 0 && (
        <section className="flex flex-col flex-1 min-h-0 pt-6 border-t border-black/5 dark:border-white/5 relative">
          <h2 className="flex-shrink-0 text-xs font-black mb-5 text-muted-foreground uppercase tracking-[0.2em] px-2 flex items-center gap-2">
            <CheckCircle2 size={14} className="text-emerald-500" />
            Completados Recientemente
          </h2>

          <div className="flex-1 overflow-y-auto pr-2 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden space-y-3">
            {finalizados.map((ticket) => (
              <div
                key={ticket.id}
                className="bg-card dark:bg-background/40 p-4 rounded-xl border border-black/5 dark:border-white/5 flex flex-col md:flex-row md:justify-between md:items-center gap-3 opacity-70 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5 transition-all group shadow-sm"
              >
                <div className="flex-1">
                  <h3 className="font-bold text-foreground text-sm group-hover:text-emerald-400 transition-colors">
                    {ticket.title}
                  </h3>

                  <p className="text-[10px] text-muted-foreground font-medium mt-2 flex flex-wrap items-center gap-2">
                    <span className="uppercase tracking-widest font-mono text-[9px]">ID: {ticket.id.substring(0,6)}</span>
                    <span className="w-1 h-1 rounded-full bg-black/20 dark:bg-white/20" />
                    Cerrado el {new Date(ticket.created_at).toLocaleDateString()}
                    
                    {ticket.profiles && (
                      <>
                        <span className="w-1 h-1 rounded-full bg-black/20 dark:bg-white/20" />
                        <span>
                          {Array.isArray(ticket.profiles)
                            ? `${ticket.profiles[0]?.first_name} ${ticket.profiles[0]?.last_name}`
                            : `${ticket.profiles.first_name} ${ticket.profiles.last_name}`}
                        </span>
                      </>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-400 font-black text-[10px] uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 w-fit">
                  <CheckCircle2 size={12} /> Resuelto
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
