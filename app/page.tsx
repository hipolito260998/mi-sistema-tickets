"use client";

import { TicketForm } from "@/components/TicketForm";
import { TicketList } from "@/components/TicketList";
import { useTickets } from "@/hooks/useTickets";
import { ticketService } from "@/services/ticketService";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { Suspense, useState } from "react";

function PortalClienteContent() {
  const supabase = createClient();
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);

  const { tickets: misTickets, loading: loadingTickets } = useTickets(supabase, userId || undefined);

  // useEffect(() => {
  //   supabase.auth.getUser().then(({ data }) => {
  //     if (data.user) {
  //       setUserId(data.user.id);
  //     } else {
  //       // Si no está autenticado, redirigir al login con reload
  //       window.location.href = '/login';
  //     }
  //   });
  // }, [supabase, router]);

  const handleCrearTicket = async (data: { title: string; description: string; priority: string }) => {
    if (!userId) throw new Error("No hay sesión");
    
    await ticketService.createTicket(supabase, {
      ...data,
      customer_id: userId
    });
  };

  return (
    <main className="min-h-screen md:min-h-0 md:h-[calc(100vh-80px)] bg-slate-50/50 p-6 md:p-10 flex flex-col md:overflow-hidden">
      <div className="max-w-6xl mx-auto w-full h-full flex flex-col min-h-0">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 h-full min-h-0">
          
          <div className="md:col-span-1 h-fit">
            <TicketForm onSubmit={handleCrearTicket} />
          </div>

          <div className="md:col-span-2 h-full md:overflow-hidden pb-4">
            <Suspense fallback={<div className="flex items-center justify-center h-full"><div className="text-slate-500">Cargando tickets...</div></div>}>
              <TicketList tickets={misTickets} loading={loadingTickets} />
            </Suspense>
          </div>

        </div>
      </div>
    </main>
  );
}

export default function PortalCliente() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="text-slate-500">Cargando...</div></div>}>
      <PortalClienteContent />
    </Suspense>
  );
}