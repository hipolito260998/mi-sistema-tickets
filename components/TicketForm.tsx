"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { TicketPriority } from "@/types/ticket";
import { useState } from "react";
import { Command } from "lucide-react";

interface TicketFormProps {
  onSubmit: (data: { title: string; description: string; priority: TicketPriority }) => Promise<void>;
}

export const TicketForm = ({ onSubmit }: TicketFormProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TicketPriority>("MEDIUM");
  const [loadingAction, setLoadingAction] = useState(false);
  const [enviadoExitoso, setEnviadoExitoso] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingAction(true);
    
    try {
      await onSubmit({ title, description, priority });
      setEnviadoExitoso(true);
      setTitle("");
      setDescription("");
      setPriority("MEDIUM");
      setTimeout(() => setEnviadoExitoso(false), 3000);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingAction(false);
    }
  };

  return (
      <Card className="border-black/10 dark:border-white/10 overflow-hidden w-full relative backdrop-blur-xl">
        {/* Glow Effects */}
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_rgba(101,32,255,0.15),_transparent_50%)] pointer-events-none opacity-0 dark:opacity-100 transition-opacity" />
        
        {/* Barra superior de estado */}
        <div className={`absolute top-0 left-0 h-1 w-full transition-all duration-500 ${enviadoExitoso ? 'bg-green-500' : 'bg-primary'}`} />
        
        <CardHeader className="space-y-1 pb-6 pt-8 relative z-10">
          <CardTitle className="text-2xl font-black text-foreground flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/30 text-primary">
              <Command size={18} />
            </span>
            Nuevo Reporte
          </CardTitle>
          <p className="text-sm text-muted-foreground font-medium leading-relaxed mt-2">
            Detalla la incidencia técnica. Serás atendido a la brevedad.
          </p>
        </CardHeader>

        <CardContent className="relative z-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2 group">
              <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest group-focus-within:text-primary transition-colors">
                Asunto
              </Label>
              <Input 
                required 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej. Problema de acceso al servidor"
                className="rounded-xl bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent text-foreground placeholder-black/30 dark:placeholder-white/20 hover:border-black/20 dark:hover:border-white/20 transition-all"
              />
            </div>

            <div className="space-y-2 group">
              <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest group-focus-within:text-primary transition-colors">
                Prioridad
              </Label>
              <Select value={priority} onValueChange={(val) => setPriority(val as TicketPriority)}>
                <SelectTrigger className="rounded-xl bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent text-foreground hover:border-black/20 dark:hover:border-white/20 transition-all">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-background border-black/10 dark:border-white/10 rounded-xl">
                  <SelectItem value="LOW" className="text-emerald-400 font-bold focus:bg-emerald-400/10 focus:text-emerald-300">Baja</SelectItem>
                  <SelectItem value="MEDIUM" className="text-blue-400 font-bold focus:bg-blue-400/10 focus:text-blue-300">Media</SelectItem>
                  <SelectItem value="HIGH" className="text-orange-400 font-bold focus:bg-orange-400/10 focus:text-orange-300">Alta</SelectItem>
                  <SelectItem value="URGENT" className="text-rose-500 font-black focus:bg-rose-500/10 focus:text-rose-400">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 group">
              <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest group-focus-within:text-primary transition-colors">
                Descripción
              </Label>
              <Textarea 
                required 
                rows={5} 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe los pasos para reproducir o los detalles del problema..."
                className="rounded-xl bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 resize-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent text-foreground placeholder-black/30 dark:placeholder-white/20 hover:border-black/20 dark:hover:border-white/20 transition-all"
              />
            </div>

            <Button
              disabled={loadingAction}
              className={`w-full font-bold py-6 rounded-xl transition-all ${
                enviadoExitoso 
                  ? "bg-green-600 hover:bg-green-700 text-white" 
                  : "bg-primary hover:bg-primary/90 text-primary-foreground hover:scale-[1.02] active:scale-95"
              }`}
            >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
              {loadingAction ? (
                <span className="flex items-center gap-3">
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Procesando...
                </span>
              ) : enviadoExitoso ? (
                "¡Ticket Enviado! ✅"
              ) : (
                "Enviar Ticket"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
  );
};