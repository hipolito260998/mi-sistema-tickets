import { ticketService } from '@/services/ticketService';
import { Ticket } from '@/types/ticket';
import { SupabaseClient } from '@supabase/supabase-js';
import { useCallback, useEffect, useState } from 'react';

export function useTickets(supabase: SupabaseClient, userId?: string) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTickets = useCallback(async () => {
    try {
      const data = await ticketService.getAllTickets(supabase);
      const baseData = data || [];
      // Si hay userId filtramos (Portal), si no, mostramos todo (Admin)
      const filtrados = userId 
        ? baseData.filter(t => t.customer_id === userId) 
        : baseData;

      setTickets(filtrados);
    } catch (err) {
      console.error("Error en useTickets:", err);
    } finally {
      setLoading(false);
    }
  }, [supabase, userId]);

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      await ticketService.updateTicketStatus(supabase, id, newStatus);
      // Actualización optimista para feedback instantáneo
      setTickets(prev => 
        prev.map(t => t.id === id ? { ...t, status: newStatus as any } : t)
      );
    } catch (err) {
      console.error("Error al actualizar estado:", err);
      alert("No se pudo actualizar el estado.");
    }
  };

  useEffect(() => {
    let isMounted = true;
    fetchTickets();

    const canal = supabase
      .channel("realtime-tickets")
      .on("postgres_changes", 
        { event: "*", schema: "public", table: "tickets" }, 
        () => { if (isMounted) fetchTickets(); }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(canal);
    };
  }, [fetchTickets, supabase]);

  return { tickets, loading, updateStatus, refresh: fetchTickets };
}