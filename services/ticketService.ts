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
          area,
          profiles:customer_id (first_name, last_name, email, role, area)
        `)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error en getAllTickets:", error);
        // Si falla el join, intentar sin profiles
        const { data: fallbackData, error: fallbackError } = await supabase
          .from("tickets")
          .select(`id, title, description, status, priority, created_at, customer_id, area`)
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

  async getTicketsByArea(supabase: SupabaseClient, area: string): Promise<Ticket[]> {
    try {
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
          area,
          profiles:customer_id (first_name, last_name, email, role, area)
        `)
        .eq("area", area)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error en getTicketsByArea:", error);
        return [];
      }
      return (data as unknown as Ticket[]) || [];
    } catch (err) {
      console.error("Error crítico en getTicketsByArea:", err);
      return [];
    }
  },

  async getTicketsByUserArea(supabase: SupabaseClient, userId: string): Promise<Ticket[]> {
    try {
      // Primero obtener el área del usuario
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("area")
        .eq("id", userId)
        .single();

      if (profileError || !profile?.area) {
        console.error("Error obteniendo área del usuario:", profileError);
        return [];
      }

      // Luego obtener tickets de esa área
      return this.getTicketsByArea(supabase, profile.area);
    } catch (err) {
      console.error("Error crítico en getTicketsByUserArea:", err);
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
      .select(`id, title, status, created_at, area`)
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