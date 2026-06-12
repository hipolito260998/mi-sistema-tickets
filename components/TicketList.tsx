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
    // Contenedor principal que toma el 100% del alto
    <div className="flex flex-col h-full gap-6">
      {/* ======================================= */}
      {/* CAJA 1: SOLICITUDES EN CURSO (Scroll 1) */}
      {/* ======================================= */}
      <section className="flex flex-col flex-1 min-h-0">
        {/* Encabezado Fijo */}
        <div className="flex-shrink-0 flex items-center justify-between mb-4 px-1">
          <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-600"></span>
            </span>
            Solicitudes en curso
          </h2>
          <Badge
            variant="outline"
            className="text-blue-600 border-blue-200 bg-blue-50/50"
          >
            {activos.length} pendientes
          </Badge>
        </div>

        {/* Área de Scroll de Activos */}
        <div className="flex-1 overflow-y-auto pr-2 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden space-y-4">
          {loading ? (
            <div className="h-32 w-full bg-slate-100 animate-pulse rounded-2xl" />
          ) : activos.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border-2 border-dashed border-slate-100 text-center h-full flex flex-col justify-center">
              <Inbox className="mx-auto mb-3 text-slate-200" size={40} />
              <p className="text-slate-400 font-medium">
                No tienes solicitudes pendientes por ahora.
              </p>
            </div>
          ) : (
            activos.map((ticket) => (
              <div
                key={ticket.id}
                className="group bg-white p-5 rounded-2xl shadow-sm border border-slate-100 border-l-[6px] border-l-blue-600 flex justify-between items-center hover:shadow-md transition-all duration-300"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900">{ticket.title}</h3>
                    {ticket.priority === "URGENT" && (
                      <AlertCircle
                        size={14}
                        className="text-red-500 animate-pulse"
                      />
                    )}
                  </div>

                  {ticket.profiles && (
                    <div className="flex items-center gap-2">
                      {/* Prueba este pequeño ajuste por si acaso */}
                      <div className="text-[10px] font-semibold text-slate-600">
                        👤{" "}
                        {Array.isArray(ticket.profiles)
                          ? `${ticket.profiles[0]?.first_name} ${ticket.profiles[0]?.last_name}`
                          : `${ticket.profiles.first_name} ${ticket.profiles.last_name}`}
                      </div>
                      {ticket.area && (
                        <div className="inline-block px-2 py-0.5 bg-slate-100 text-slate-700 text-[9px] font-bold rounded-full uppercase tracking-wide">
                          {ticket.area}
                        </div>
                      )}
                    </div>
                  )}

                  <p className="text-[10px] text-slate-400 font-mono tracking-tighter uppercase">
                    REF: {ticket.id.substring(0, 8)} •{" "}
                    {new Date(ticket.created_at).toLocaleDateString()}
                  </p>
                </div>

                <Badge
                  className={`rounded-full px-4 py-1 font-black text-[10px] uppercase tracking-wider ${
                    ticket.status === "OPEN"
                      ? "bg-amber-100 text-amber-700 hover:bg-amber-100"
                      : "bg-blue-100 text-blue-700 hover:bg-blue-100"
                  }`}
                >
                  {ticket.status === "OPEN" ? "ABIERTO" : "EN PROCESO"}
                </Badge>
              </div>
            ))
          )}
        </div>
      </section>

      {/* ======================================= */}
      {/* CAJA 2: HISTORIAL RESUELTO (Scroll 2)   */}
      {/* ======================================= */}
      {finalizados.length > 0 && (
        <section className="flex flex-col flex-1 min-h-0 pt-4 border-t border-slate-200">
          {/* Encabezado Fijo */}
          <h2 className="flex-shrink-0 text-sm font-black mb-4 text-slate-400 uppercase tracking-[0.2em] px-1">
            Historial Resuelto
          </h2>

          {/* Área de Scroll del Historial */}
          <div className="flex-1 overflow-y-auto pr-2 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden space-y-3">
            {finalizados.map((ticket) => (
              <div
                key={ticket.id}
                className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 flex justify-between items-center opacity-60 grayscale-[0.3] hover:opacity-100 hover:grayscale-0 transition-all group"
              >
                <div className="flex-1">
                  <h3 className="font-bold text-slate-600 text-sm group-hover:text-slate-900 transition-colors">
                    {ticket.title}
                  </h3>

                  {ticket.profiles && (
                    <div className="flex items-center gap-2 mt-1">
                      <div className="text-[9px] font-semibold text-slate-500 group-hover:text-slate-700">
                        👤 {ticket.profiles.first_name}{" "}
                        {ticket.profiles.last_name}
                      </div>
                      {ticket.area && (
                        <div className="inline-block px-1.5 py-0.5 bg-slate-200 text-slate-600 text-[8px] font-bold rounded uppercase tracking-wide">
                          {ticket.area}
                        </div>
                      )}
                    </div>
                  )}

                  <p className="text-[10px] text-slate-400 font-medium mt-1">
                    Cerrado el{" "}
                    {new Date(ticket.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-green-600 font-black text-[9px] uppercase tracking-widest">
                  RESUELTO <CheckCircle2 size={16} />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
