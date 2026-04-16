export interface Profile {
  first_name: string | null;
  last_name: string | null;
  email: string;
}

export interface Ticket {
  id: string;
  title: string;
  description?: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  created_at: string;
  customer_id: string;
  profiles: Profile | null; // El JOIN de Supabase
}

// Para cuando creas un ticket (no tienes ID ni fecha aún)
export interface CreateTicketInput {
  title: string;
  description: string;
  priority: string;
  customer_id: string;
}


// types/ticket.ts o arriba en tu hook
export type TicketStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";