export interface Profile {
  id?: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  role?: 'ADMIN' | 'CUSTOMER' | 'AREA_LEAD';
  area?: string;
}

export type TicketStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
export type TicketPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export interface Ticket {
  id: string;
  title: string;
  description?: string;
  status: TicketStatus;
  priority: TicketPriority;
  created_at: string;
  customer_id: string;
  area?: string;
  profiles: Profile | null; // El JOIN de Supabase
}

// Para cuando creas un ticket (no tienes ID ni fecha aún)
export interface CreateTicketInput {
  title: string;
  description: string;
  priority: TicketPriority;
  customer_id: string;
  area?: string;
}