"use client";

import { TicketForm } from "@/components/TicketForm";
import { TicketList } from "@/components/TicketList";
import { useTickets } from "@/hooks/useTickets";
import { ticketService } from "@/services/ticketService";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";

export default function PortalCliente() {
  const supabase = createClient();
  const [userId, setUserId] = useState<string | null>(null);

  const { tickets: misTickets, loading: loadingTickets } = useTickets(supabase, userId || undefined);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUserId(data.user.id);
    });
  }, [supabase]);

  const handleCrearTicket = async (data: { title: string; description: string; priority: string }) => {
    if (!userId) throw new Error("No hay sesión");
    
    await ticketService.createTicket(supabase, {
      ...data,
      customer_id: userId
    });
  };

  return (
    /* 1. CONTENEDOR MAESTRO: 
       - En celular: min-h-screen (comportamiento web normal).
       - En PC (md:): h-[calc(100vh-80px)] y overflow-hidden (comportamiento App).
    */
    <main className="min-h-screen md:min-h-0 md:h-[calc(100vh-80px)] bg-slate-50/50 p-6 md:p-10 flex flex-col md:overflow-hidden">
      <div className="max-w-6xl mx-auto w-full h-full flex flex-col min-h-0">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 h-full min-h-0">
          
          {/* COLUMNA 1: FORMULARIO 
              h-fit asegura que el formulario no se estire raro hacia abajo.
              Ya no necesita "sticky" ni espacios fantasma porque la pantalla no se mueve.
          */}
          <div className="md:col-span-1 h-fit">
            <TicketForm onSubmit={handleCrearTicket} />
          </div>

          {/* COLUMNA 2: LISTADO DE TICKETS
              - En PC: Toma el 100% de la altura (h-full) y activa el scroll interno (overflow-y-auto).
              - Ocultamos la barra con [scrollbar-width:none] y [&::-webkit-scrollbar]:hidden.
              - pb-12 le da un respiro al final para que el último ticket no quede pegado al piso.
          */}
          <div className="md:col-span-2 h-full md:overflow-hidden pb-4">
            <TicketList tickets={misTickets} loading={loadingTickets} />
          </div>

        </div>
      </div>
    </main>
  );
}