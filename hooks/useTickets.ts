"use client";

import { ticketService } from '@/services/ticketService';
import { Ticket, TicketStatus } from '@/types/ticket'; // Importa tus tipos
import { SupabaseClient } from '@supabase/supabase-js';
import { useCallback, useEffect, useState } from 'react';

export function useTickets(supabase: SupabaseClient, userId?: string) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  // --- NOTIFICACIONES ---
  // Tipamos el parámetro como un objeto que tiene al menos lo que necesitamos
  const enviarNotificacionNativa = (nuevoTicket: Partial<Ticket>) => {
    if (Notification.permission === "granted") {
      new Notification("🎫 Nuevo Ticket", {
        body: `${nuevoTicket.title || 'Sin título'}`,

      });
    }
  };

 const fetchTickets = useCallback(async () => {
    try {
      const data = await ticketService.getAllTickets(supabase);
      const baseData = data || [];
      const filtrados = userId 
        ? baseData.filter(t => t.customer_id === userId) 
        : baseData;

      setTickets(filtrados);

      // --- LÓGICA DE TÍTULO CONDICIONAL ---
      // Solo mostramos el contador (X) si NO hay userId (es Admin)
      // O si quieres que el cliente vea SUS propios pendientes, usa 'filtrados'
      if (!userId) { 
        const pendientesAdmin = filtrados.filter(t => t.status === "OPEN").length;
        document.title = pendientesAdmin > 0 ? `(${pendientesAdmin}) Panel Admin` : "IT HelpDesk";
      } else {
        // Para el cliente, mantenemos el título limpio o personalizado
        document.title = "Mi Soporte - IT HelpDesk";
      }

    } catch (err) {
      console.error("Error en fetchTickets:", err);
    } finally {
      setLoading(false);
    }
  }, [supabase, userId]);

  useEffect(() => {
    let isMounted = true;

    // Cargar tickets iniciales
    fetchTickets();

    // Intentar solicitar permiso de notificaciones (sin fallar si no funciona)
    try {
      if (typeof window !== "undefined" && Notification && Notification.permission !== "granted") {
        Notification.requestPermission().catch(() => {
          console.log("Notificaciones no disponibles");
        });
      }
    } catch (err) {
      console.log("Error con notificaciones:", err);
    }

    // Intentar suscribirse a cambios en realtime (sin fallar si no funciona)
    let canal: any = null;
    try {
      canal = supabase
        .channel("realtime-tickets")
        .on(
          "postgres_changes", 
          { event: "INSERT", schema: "public", table: "tickets" }, 
          (payload) => { 
            if (isMounted) {
              try {
                enviarNotificacionNativa(payload.new as Ticket);
                fetchTickets(); 
              } catch (err) {
                console.error("Error procesando INSERT:", err);
              }
            }
          }
        )
        .on(
          "postgres_changes",
          { event: "UPDATE", schema: "public", table: "tickets" },
          () => { 
            if (isMounted) {
              try {
                fetchTickets();
              } catch (err) {
                console.error("Error procesando UPDATE:", err);
              }
            }
          }
        )
        .subscribe();
    } catch (err) {
      console.error("Error suscribiendo a realtime:", err);
    }

    return () => {
      isMounted = false;
      if (canal) {
        try {
          supabase.removeChannel(canal);
        } catch (err) {
          console.error("Error removiendo canal:", err);
        }
      }
    };
  }, [fetchTickets, supabase]);

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      await ticketService.updateTicketStatus(supabase, id, newStatus);
      
      setTickets(prev => 
        prev.map(t => t.id === id 
          ? { ...t, status: newStatus as TicketStatus } // <-- Convertimos string a TicketStatus
          : t
        )
      );
    } catch (err) {
      console.error("Error al actualizar:", err);
    }
  };

  const borrarTicket = async (id: string) => {
    try {
      // 1. Lo borramos de la base de datos
      await ticketService.deleteTicket(supabase, id);
      
      // 2. Lo quitamos de la pantalla instantáneamente
      setTickets((prev) => prev.filter((ticket) => ticket.id !== id));
    } catch (error) {
      console.error("Error al eliminar el ticket:", error);
    }
  };

  return { tickets, loading, updateStatus, refresh: fetchTickets,borrarTicket };
}