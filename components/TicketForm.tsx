"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

interface TicketFormProps {
  onSubmit: (data: { title: string; description: string; priority: string }) => Promise<void>;
}

export const TicketForm = ({ onSubmit }: TicketFormProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
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
      <Card className="shadow-xl border-slate-200 overflow-hidden w-full">
        {/* Barra de estado superior decorativa */}
        <div className={`h-1.5 w-full transition-colors duration-500 ${enviadoExitoso ? 'bg-green-500' : 'bg-blue-600'}`} />
        
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-black text-slate-800 tracking-tight">
            Nuevo Reporte
          </CardTitle>
          <p className="text-[11px] text-slate-400 font-medium leading-none">
            Describe tu problema técnico para ayudarte.
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label className="text-[10px] uppercase font-black text-slate-400 tracking-widest">
                Asunto
              </Label>
              <Input 
                required 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="¿Qué sucede?"
                className="rounded-xl border-slate-200 focus-visible:ring-blue-600"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-[10px] uppercase font-black text-slate-400 tracking-widest">
                Prioridad
              </Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger className="rounded-xl border-slate-200 font-bold text-slate-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW" className="text-green-600 font-medium">Baja</SelectItem>
                  <SelectItem value="MEDIUM" className="text-blue-600 font-medium">Media</SelectItem>
                  <SelectItem value="HIGH" className="text-orange-600 font-medium">Alta</SelectItem>
                  <SelectItem value="URGENT" className="text-red-600 font-bold">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[10px] uppercase font-black text-slate-400 tracking-widest">
                Descripción
              </Label>
              <Textarea 
                required 
                rows={4} 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe el problema..."
                className="rounded-xl border-slate-200 resize-none focus-visible:ring-blue-600"
              />
            </div>

            <Button
              disabled={loadingAction}
              className={`w-full font-bold py-6 rounded-xl transition-all duration-500 shadow-lg ${
                enviadoExitoso 
                  ? "bg-green-500 hover:bg-green-600 scale-[1.02] shadow-green-100" 
                  : "bg-blue-600 hover:bg-blue-700 shadow-blue-100"
              } text-white`}
            >
              {loadingAction ? (
                <span className="flex items-center gap-2">
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