"use client";

import { useTickets } from "@/hooks/useTickets";
import { ticketService } from "@/services/ticketService";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function PortalCliente() {
  const supabase = createClient();
  const router = useRouter();

  // Estados de UI originales
  const [loadingAction, setLoadingAction] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [enviadoExitoso, setEnviadoExitoso] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Estados del formulario originales
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("MEDIUM");

  // Usamos nuestro Hook limpio
  const { tickets: misTickets, loading: loadingTickets } = useTickets(supabase, userId || undefined);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUserId(data.user.id);
    });
  }, [supabase]);

  // Tu lógica de separación original
  const ticketsActivos = misTickets.filter(
    (t) => t.status === "OPEN" || t.status === "IN_PROGRESS"
  );
  const ticketsFinalizados = misTickets.filter(
    (t) => t.status === "RESOLVED" || t.status === "CLOSED"
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoadingAction(true);
    setMensaje("");

    if (!userId) {
      router.push("/login");
      return;
    }

    try {
      await ticketService.createTicket(supabase, {
        title,
        description,
        priority,
        customer_id: userId
      });

      setMensaje("✅ Ticket enviado correctamente.");
      setEnviadoExitoso(true);
      
      // Tu animación de éxito original
      setTimeout(() => {
        setEnviadoExitoso(false);
        setMensaje("");
      }, 3000);

      setTitle("");
      setDescription("");
    } catch (error) {
      setMensaje("❌ Error al crear el ticket.");
    } finally {
      setLoadingAction(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* COLUMNA 1: FORMULARIO (Tu diseño original) */}
        <div className="md:col-span-1">
          <div className="bg-white p-6 rounded-xl shadow-md sticky top-6">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Nuevo Reporte</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Título</label>
                <input
                  type="text" required value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="¿Qué sucede?"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Prioridad</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white outline-none font-bold"
                >
                  <option value="LOW">Baja</option>
                  <option value="MEDIUM">Media</option>
                  <option value="HIGH">Alta</option>
                  <option value="URGENT">Urgente</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Descripción</label>
                <textarea
                  required rows={3} value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white resize-none focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Describe el problema..."
                />
              </div>
              <button
                disabled={loadingAction}
                className={`w-full font-bold py-2 rounded-lg transition-all duration-500 ${
                  enviadoExitoso ? "bg-green-500 hover:bg-green-600 scale-105" : "bg-blue-600 hover:bg-blue-700"
                } text-white disabled:opacity-50`}
              >
                {loadingAction ? "Enviando..." : enviadoExitoso ? "¡Recibido! ✅" : "Enviar Ticket"}
              </button>
            </form>
            {mensaje && <p className="mt-4 text-sm text-center font-medium text-blue-600">{mensaje}</p>}
          </div>
        </div>

        {/* COLUMNA 2: LISTADO (Tu diseño original) */}
        <div className="md:col-span-2 space-y-10">
          <section>
            <h2 className="text-xl font-bold mb-4 text-blue-600 flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-600 rounded-full animate-ping"></span>
              Solicitudes en curso
            </h2>
            <div className="space-y-4">
              {loadingTickets ? <p className="text-gray-400 italic">Cargando...</p> : 
               ticketsActivos.length === 0 ? (
                <div className="bg-white p-6 rounded-xl border border-dashed border-gray-300 text-center text-gray-400 text-sm">
                  No tienes solicitudes pendientes.
                </div>
              ) : (
                ticketsActivos.map((ticket) => (
                  <div key={ticket.id} className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-blue-500 flex justify-between items-center transition hover:shadow-md">
                    <div>
                      <h3 className="font-semibold text-gray-900">{ticket.title}</h3>
                      <p className="text-xs text-gray-400">
                        ID: {ticket.id.substring(0, 8)} • {new Date(ticket.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${ticket.status === "OPEN" ? "bg-yellow-100 text-yellow-700" : "bg-blue-100 text-blue-700"}`}>
                      {ticket.status === "OPEN" ? "Abierto" : "En Proceso"}
                    </span>
                  </div>
                ))
              )}
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-4 text-gray-500">Historial de tickets</h2>
            <div className="space-y-3">
              {ticketsFinalizados.length === 0 ? (
                <p className="text-gray-400 text-sm italic pl-2">Aún no tienes tickets cerrados.</p>
              ) : (
                ticketsFinalizados.map((ticket) => (
                  <div key={ticket.id} className="bg-gray-100/50 p-4 rounded-xl border border-gray-200 flex justify-between items-center opacity-80 grayscale-[0.5]">
                    <div>
                      <h3 className="font-medium text-gray-700 line-through decoration-gray-400">{ticket.title}</h3>
                      <p className="text-xs text-gray-400">Finalizado el {new Date(ticket.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-2 text-green-600">
                      <span className="text-xs font-bold uppercase tracking-wider">Resuelto</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}