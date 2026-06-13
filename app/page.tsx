"use client";

import { TicketForm } from "@/components/TicketForm";
import { TicketList } from "@/components/TicketList";
import { useTickets } from "@/hooks/useTickets";
import { ticketService } from "@/services/ticketService";
import { TicketPriority } from "@/types/ticket";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function PortalClienteContent() {
  const supabase = createClient();
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);

  const { tickets: misTickets, loading: loadingTickets } = useTickets(supabase, userId || undefined);

  useEffect(() => {
    // Verificar autenticación y obtener userId
    const checkAuth = async () => {
      // Evitar la redirección si venimos de un correo de recuperación o de login
      if (typeof window !== 'undefined') {
        const url = window.location.href;
        if (url.includes('type=recovery') || url.includes('access_token=') || url.includes('code=')) {
          return; // Pausamos aquí para que el AuthListener atrape el evento
        }
      }

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUserId(user.id);
        } else {
          // No autenticado - redirigir a login
          window.location.href = '/login';
        }
      } catch (error) {
        console.error('Error verificando autenticación:', error);
        // Si hay error, permitir acceso (fallback seguro)
      } finally {
        setChecking(false);
      }
    };

    checkAuth();
  }, [supabase]);

  const handleCrearTicket = async (data: { title: string; description: string; priority: TicketPriority }) => {
    if (!userId) throw new Error("No hay sesión");
    
    // Obtener el perfil del usuario para conseguir su área
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("area")
      .eq("id", userId)
      .single();

    const area = profile?.area || "GENERAL";

    await ticketService.createTicket(supabase, {
      ...data,
      customer_id: userId,
      area: area  // Asignar área automáticamente
    });
  };

  return (
    <main className="flex-1 bg-background flex flex-col font-sans selection:bg-primary/30 lg:overflow-hidden">
      
      {/* Hero Banner */}
      <div className="relative overflow-hidden bg-background border-b border-black/10 dark:border-white/5 py-8 lg:py-6 flex-shrink-0">
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tight mb-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            Hola, <span className="text-primary">¿En qué puedo ayudarte?</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
            Crea un nuevo reporte técnico o revisa el estado de tus solicitudes recientes. Estoy aquí para resolver tus problemas al instante.
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 w-full max-w-6xl mx-auto px-6 py-6 lg:py-8 flex flex-col min-h-0">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12 h-full min-h-0">
          
          <div className="lg:col-span-1 h-full overflow-y-auto pr-2 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
            <TicketForm onSubmit={handleCrearTicket} />
          </div>

          <div className="lg:col-span-2 h-full overflow-hidden pb-4 flex flex-col animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
            <Suspense fallback={
              <div className="flex items-center justify-center h-full">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                  <div className="text-muted-foreground font-medium text-sm tracking-widest uppercase">Cargando</div>
                </div>
              </div>
            }>
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