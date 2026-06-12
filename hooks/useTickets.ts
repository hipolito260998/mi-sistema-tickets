"use client";

import { notificarTicketCerrado, notificarTicketEnProgreso } from '@/actions/emailActions';
import { ticketService } from '@/services/ticketService';
import { Ticket, TicketStatus } from '@/types/ticket';
import { SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

export function useTickets(supabase: SupabaseClient, userId?: string) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string>('CUSTOMER');
  const [userArea, setUserArea] = useState<string | null>(null);

  // --- NOTIFICACIONES ---
  const enviarNotificacionNativa = (nuevoTicket: Partial<Ticket>) => {
    if (Notification.permission === "granted") {
      new Notification("🎫 Nuevo Ticket", {
        body: `${nuevoTicket.title || 'Sin título'}`,
      });
    }
  };

  const fetchTickets = useCallback(async () => {
    try {
      // 1. Obtener perfil del usuario actual
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return;

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role, area")
        .eq("id", authUser.id)
        .single();

      const role = profile?.role || 'CUSTOMER';
      const area = profile?.area || null;
      setUserRole(role);
      setUserArea(area);

      // 2. Obtener tickets según el rol
      let data;
      if (role === 'ADMIN') {
        // Admin ve TODOS los tickets
        console.log('[useTickets] Cargando todos los tickets (ADMIN)');
        data = await ticketService.getAllTickets(supabase);
      } else if (role === 'AREA_LEAD') {
        // Líder de área ve solo tickets de su área
        console.log('[useTickets] Cargando tickets del área:', area, '(AREA_LEAD)');
        data = await ticketService.getTicketsByUserArea(supabase, authUser.id);
      } else {
        // Customer ve solo sus propios tickets
        console.log('[useTickets] Cargando tickets del customer:', authUser.id);
        data = await ticketService.getAllTickets(supabase);
        data = data.filter(t => t.customer_id === authUser.id) || [];
      }

      setTickets(data || []);

      // --- LÓGICA DE TÍTULO CONDICIONAL ---
      if (role === 'ADMIN') { 
        const pendientesAdmin = (data || []).filter(t => t.status === "OPEN").length;
        document.title = pendientesAdmin > 0 ? `(${pendientesAdmin}) Panel Admin` : "IT HelpDesk";
      } else if (role === 'AREA_LEAD') {
        const pendientesArea = (data || []).filter(t => t.status === "OPEN").length;
        document.title = pendientesArea > 0 ? `(${pendientesArea}) ${area}` : `${area} - IT HelpDesk`;
      } else {
        document.title = "Mi Soporte - IT HelpDesk";
      }
    } catch (err) {
      console.error("Error en fetchTickets:", err);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

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
    let canal: RealtimeChannel | null = null;
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
    // 1. Guardar el estado previo para la UI Optimista
    const previousTickets = [...tickets];
    const ticketTarget = previousTickets.find(t => t.id === id);

    // 2. UI Optimista: Actualizar inmediatamente la UI
    setTickets(prev => 
      prev.map(t => t.id === id 
        ? { ...t, status: newStatus as TicketStatus }
        : t
      )
    );

    try {
      // 3. Actualizamos en Supabase
      await ticketService.updateTicketStatus(supabase, id, newStatus);
      toast.success('Estado actualizado correctamente');

      // 4. Lógica de correos automatizados
      if (ticketTarget) {
        const emailCliente = ticketTarget.profiles?.email;
        const tituloTicket = ticketTarget.title;

        if (emailCliente) {
          // --- CONDICIÓN 1: Pasa a En Progreso ---
          if (newStatus === 'IN_PROGRESS') {
            notificarTicketEnProgreso(id, tituloTicket, emailCliente)
              .then(res => {
                if (!res.success) console.error("Error email progreso:", res.error);
                else console.log("Notificación de progreso enviada a:", emailCliente);
              });
          } 
          // --- CONDICIÓN 2: Pasa a Cerrado/Resuelto ---
          // Nota: Verifica que 'CLOSED' sea exactamente el nombre del estado en tu base de datos
          else if (newStatus === 'CLOSED') {
            notificarTicketCerrado(id, tituloTicket, emailCliente)
              .then(res => {
                if (!res.success) console.error("Error email cerrado:", res.error);
                else console.log("Notificación de cierre enviada a:", emailCliente);
              });
          }
        }
      }
    } catch (err) {
      console.error("Error al actualizar:", err);
      toast.error('Error al actualizar el estado');
      // Revertir UI si hubo error
      setTickets(previousTickets);
    }
  };

  const borrarTicket = async (id: string) => {
    const previousTickets = [...tickets];
    // UI Optimista
    setTickets((prev) => prev.filter((ticket) => ticket.id !== id));

    try {
      await ticketService.deleteTicket(supabase, id);
      toast.success('Ticket eliminado');
    } catch (error) {
      console.error("Error al eliminar el ticket:", error);
      toast.error('Error al eliminar el ticket');
      // Revertir
      setTickets(previousTickets);
    }
  };

  return { tickets, loading, updateStatus, refresh: fetchTickets, borrarTicket, userRole, userArea };
}