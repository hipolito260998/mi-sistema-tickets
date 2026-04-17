import { CreateTicketInput, Ticket } from '@/types/ticket';
import { SupabaseClient } from '@supabase/supabase-js';

export const ticketService = {
  async getAllTickets(supabase: SupabaseClient): Promise<Ticket[]> {
    try {
      // Intentar traer con el join a profiles
      const { data, error } = await supabase
        .from("tickets")
        .select(`
          id, 
          title, 
          description, 
          status, 
          priority, 
          created_at, 
          customer_id,
          profiles:customer_id (first_name, last_name, email)
        `)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error en getAllTickets:", error);
        // Si falla el join, intentar sin profiles
        const { data: fallbackData, error: fallbackError } = await supabase
          .from("tickets")
          .select(`id, title, description, status, priority, created_at, customer_id`)
          .order("created_at", { ascending: false });
        
        if (fallbackError) {
          console.error("Error en fallback getAllTickets:", fallbackError);
          return [];
        }
        return (fallbackData as unknown as Ticket[]) || [];
      }
      return (data as unknown as Ticket[]) || [];
    } catch (err) {
      console.error("Error crítico en getAllTickets:", err);
      return [];
    }
  },

  async updateTicketStatus(supabase: SupabaseClient, id: string, status: string): Promise<void> {
    const { error } = await supabase.from("tickets").update({ status }).eq("id", id);
    if (error) throw error;
  },

  async createTicket(supabase: SupabaseClient, ticketData: CreateTicketInput): Promise<Ticket> {
    const { data, error } = await supabase
      .from("tickets")
      .insert([ticketData])
      .select(`id, title, status, created_at`)
      .single();

    if (error) throw error;
    return data as Ticket;
  },

  deleteTicket: async (supabase: SupabaseClient, id: string) => {
    const { error } = await supabase
      .from('tickets')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};