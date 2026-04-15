"use client";

import { createClient } from "@/utils/supabase/client";
import { useCallback, useEffect, useState } from "react";
// 1. Importamos el tipo oficial de Supabase
import { RealtimeChannel } from "@supabase/supabase-js";

// --- INTERFACE ---
interface Ticket {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  created_at: string;
  customer_id: string;
  profiles: {
    first_name: string | null;
    last_name: string | null;
    email: string;
  } | null;
}

const ordenEstados: Record<string, number> = {
  OPEN: 1,
  IN_PROGRESS: 2,
  RESOLVED: 3,
  CLOSED: 4,
};

export default function DashboardAgente() {
  const supabase = createClient();

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [actualizando, setActualizando] = useState<string | null>(null);

  const [filtroPrioridad, setFiltroPrioridad] = useState("TODOS");

  const obtenerTickets = useCallback(async () => {
    const { data, error } = await supabase
      .from("tickets")
      .select(
        `id, title, description, status, priority, created_at, profiles:customer_id (first_name, last_name, email)`,
      )
      .order("created_at", { ascending: false });

    if (!error && data) {
      const listaOrdenada = (data as unknown as Ticket[]).sort(
        (a, b) =>
          (ordenEstados[a.status] || 99) - (ordenEstados[b.status] || 99),
      );
      return listaOrdenada;
    }
    return [];
  }, [supabase]);

  useEffect(() => {
    let activo = true;
    // 2. Definimos la variable del canal con el tipo correcto
    let canal: RealtimeChannel | null = null;

    const inicializar = async () => {
      const datos = await obtenerTickets();
      if (activo) {
        setTickets(datos);
        setLoading(false);
      }
    };
    inicializar();

    // 3. Asignamos la suscripción a la variable
    canal = supabase
      .channel("dashboard-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "tickets" },
        async () => {
          const nuevosDatos = await obtenerTickets();
          if (activo) setTickets(nuevosDatos);
        },
      )
      .subscribe();

    return () => {
      activo = false;
      // 4. Limpieza segura
      if (canal) {
        supabase.removeChannel(canal);
      }
    };
  }, [obtenerTickets, supabase]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const pendientes = tickets.filter((t) => t.status === "OPEN").length;
      document.title =
        pendientes > 0 ? `(${pendientes}) Tickets Pendientes` : "Dashboard TI";
    }
  }, [tickets]);

  const ticketsFiltrados = tickets.filter((t) => {
    if (filtroPrioridad === "TODOS") return true;
    return t.priority === filtroPrioridad;
  });

  const cambiarEstado = async (idTicket: string, nuevoEstado: string) => {
    setActualizando(idTicket);
    const { error } = await supabase
      .from("tickets")
      .update({ status: nuevoEstado })
      .eq("id", idTicket);
    if (!error) {
      setTickets((prev) => {
        const nueva = prev.map((t) =>
          t.id === idTicket ? { ...t, status: nuevoEstado } : t,
        );
        return [...nueva].sort(
          (a, b) =>
            (ordenEstados[a.status] || 99) - (ordenEstados[b.status] || 99),
        );
      });
    }
    setActualizando(null);
  };

  const totalPendientes = tickets.filter((t) => t.status === "OPEN").length;

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Panel de Control</h1>
          {totalPendientes > 0 && (
            <span className="bg-red-500 text-white px-4 py-1 rounded-full text-sm font-bold animate-pulse">
              {totalPendientes} pendientes
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 mb-8 bg-white p-3 rounded-2xl shadow-sm border border-gray-200 w-fit">
          <span className="text-xs font-bold text-gray-400 uppercase ml-2 mr-2">
            Filtrar:
          </span>
          {[
            { id: "TODOS", label: "Ver Todo", color: "bg-gray-800" },
            { id: "URGENT", label: "Urgente", color: "bg-red-600" },
            { id: "HIGH", label: "Alta", color: "bg-orange-500" },
            { id: "MEDIUM", label: "Media", color: "bg-blue-600" },
            { id: "LOW", label: "Baja", color: "bg-green-600" },
          ].map((boton) => (
            <button
              key={boton.id}
              onClick={() => setFiltroPrioridad(boton.id)}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filtroPrioridad === boton.id
                  ? `${boton.color} text-white shadow-lg scale-105`
                  : "bg-gray-50 text-gray-500 hover:bg-gray-200"
              }`}
            >
              {boton.label}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-center p-20 text-gray-400">
            Sincronizando tickets...
          </p>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-800 text-white text-[10px] uppercase tracking-widest">
                  <th className="p-4">Usuario</th>
                  <th className="p-4">Detalles</th>
                  <th className="p-4 text-center">Prioridad</th>
                  <th className="p-4 text-center">Estado</th>
                  <th className="p-4 text-center">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {ticketsFiltrados.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="p-20 text-center text-gray-400 italic"
                    >
                      No hay tickets con prioridad &quot;{filtroPrioridad}&quot;
                    </td>
                  </tr>
                ) : (
                  ticketsFiltrados.map((ticket) => (
                    // Busca esta línea en tu DashboardAgente:
                    <tr
                      key={ticket.id}
                      className={`transition-all duration-300 ${
                        ticket.status === "CLOSED" ||
                        ticket.status === "RESOLVED"
                          ? "bg-gray-100 text-gray-400" // Quitamos grayscale y opacity, usamos colores planos
                          : "bg-white hover:bg-blue-50/30 text-gray-900"
                      }`}
                    >
                      <td className="p-4">
                        <div className="text-sm font-bold text-gray-900">
                          {ticket.profiles?.first_name}{" "}
                          {ticket.profiles?.last_name}
                        </div>
                        <div className="text-[10px] text-gray-400">
                          {ticket.profiles?.email}
                        </div>
                      </td>
                      <td className="p-4 text-sm">
                        <div className="font-bold text-gray-800">
                          {ticket.title}
                        </div>
                        <div className="text-xs text-gray-500 italic line-clamp-1">
                          {ticket.description}
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <span
                          className={`min-w-20 px-2 py-1 rounded-full text-[10px] font-black uppercase border ${
                            ticket.priority === "URGENT"
                              ? "bg-red-600 text-white border-red-700"
                              : ticket.priority === "HIGH"
                                ? "bg-orange-500 text-white border-orange-600"
                                : ticket.priority === "MEDIUM"
                                  ? "bg-blue-100 text-blue-700 border-blue-200"
                                  : "bg-emerald-100 text-emerald-700 border-emerald-200"
                          }`}
                        >
                          {ticket.priority === "URGENT"
                            ? "⚡ Urgente"
                            : ticket.priority === "HIGH"
                              ? "Alta"
                              : ticket.priority === "MEDIUM"
                                ? "Media"
                                : "Baja"}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <select
                          value={ticket.status}
                          disabled={actualizando === ticket.id}
                          onChange={(e) =>
                            cambiarEstado(ticket.id, e.target.value)
                          }
                          className={`text-[10px] font-bold rounded-lg px-2 py-1 border outline-none cursor-pointer ${
                            ticket.status === "OPEN"
                              ? "bg-yellow-100 text-yellow-800 border-yellow-300"
                              : ticket.status === "IN_PROGRESS"
                                ? "bg-blue-100 text-blue-800 border-blue-300"
                                : "bg-red-100 text-red-800 border-red-300"
                          }`}
                        >
                          <option value="OPEN">Abierto</option>
                          <option value="IN_PROGRESS">En Progreso</option>
                          <option value="RESOLVED">Resuelto</option>
                          <option value="CLOSED">Cerrado</option>
                        </select>
                      </td>
                      <td className="p-4 text-center text-[11px] text-gray-400 font-mono">
                        {new Date(ticket.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
