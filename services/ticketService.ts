import { CreateTicketInput, Ticket } from '@/types/ticket';
import { SupabaseClient } from '@supabase/supabase-js';

export const ticketService = {
  async getAllTickets(supabase: SupabaseClient): Promise<Ticket[]> {
    const { data, error } = await supabase
      .from("tickets")
      .select(`
        id, title, description, status, priority, created_at, customer_id,
        profiles:customer_id (first_name, last_name, email)
      `)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data as unknown as Ticket[]) || [];
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