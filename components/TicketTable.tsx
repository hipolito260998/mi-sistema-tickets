"use client";

import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Ticket } from "@/types/ticket";
import { AlertCircle, AlertTriangle, Trash2 } from "lucide-react"; // <-- Agregué AlertTriangle para el modal
import { useState } from "react"; // <-- 1. Importamos useState

interface TicketTableProps {
  tickets: Ticket[];
  actualizandoId: string | null;
  onStatusChange: (id: string, nuevoEstado: string) => void;
  filtroPrioridad: string;
  onDelete: (id: string) => void;
}

export const TicketTable = ({
  tickets,
  actualizandoId,
  onStatusChange,
  filtroPrioridad,
  onDelete,
}: TicketTableProps) => {
  
  // --- 2. NUEVO ESTADO PARA EL MODAL ---
  // Guarda el ID del ticket que queremos borrar, o null si el modal está cerrado
  const [ticketToDelete, setTicketToDelete] = useState<string | null>(null);

  const statusPriority: Record<string, number> = {
    OPEN: 1,
    IN_PROGRESS: 2,
    RESOLVED: 3,
    CLOSED: 4,
  };

  const priorityTranslations: Record<string, string> = {
    URGENT: "Urgente",
    HIGH: "Alta",
    MEDIUM: "Media",
    LOW: "Baja",
  };

  const ticketsOrdenados = [...tickets].sort((a, b) => {
    const pesoA = statusPriority[a.status] || 99;
    const pesoB = statusPriority[b.status] || 99;
    if (pesoA !== pesoB) return pesoA - pesoB;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const getPriorityStyles = (priority: string) => {
    switch (priority?.toUpperCase()) {
      case "URGENT": return "bg-red-600 text-white border-none shadow-sm";
      case "HIGH": return "bg-orange-50 text-orange-600 border-orange-200";
      case "MEDIUM": return "bg-blue-50 text-blue-600 border-blue-200";
      default: return "bg-green-50 text-green-600 border-green-200";
    }
  };

  const getStatusStyles = (status: string) => {
    switch (status?.toUpperCase()) {
      case "CLOSED": return "bg-red-50 text-red-600 border-red-200";
      case "RESOLVED": return "bg-purple-50 text-purple-600 border-purple-200";
      case "IN_PROGRESS": return "bg-blue-50 text-blue-600 border-blue-200";
      case "OPEN": return "bg-green-50 text-green-600 border-green-200";
      default: return "bg-slate-50 text-slate-600 border-slate-200";
    }
  };

  return (
    <> {/* Envolvemos todo en un fragmento vacío para poder poner el modal por fuera de la tabla */}
      <div className="bg-white h-full flex flex-col w-full">
        <div className="flex-1 min-h-0 w-full relative [&>div]:h-full [&>div]:overflow-auto [&>div]:[scrollbar-width:none] [&>div::-webkit-scrollbar]:hidden">
          <Table className="border-collapse-separate border-spacing-0">
            <TableHeader className="sticky top-0 z-20 bg-gray-900 shadow-md">
              <TableRow className="border-none hover:bg-transparent">
                <TableHead className="p-4 text-white text-[10px] uppercase tracking-widest font-black bg-gray-900 h-12">Usuario</TableHead>
                <TableHead className="p-4 text-white text-[10px] uppercase tracking-widest font-black bg-gray-900 h-12">Detalles</TableHead>
                <TableHead className="p-4 text-white text-[10px] uppercase tracking-widest font-black text-center bg-gray-900 h-12">Prioridad</TableHead>
                <TableHead className="p-4 text-white text-[10px] uppercase tracking-widest font-black text-center bg-gray-900 h-12">Estado</TableHead>
                <TableHead className="p-4 text-white text-[10px] uppercase tracking-widest font-black text-center bg-gray-900 h-12">Fecha</TableHead>
                <TableHead className="w-[50px] bg-gray-900 h-12"></TableHead>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100">
              {ticketsOrdenados.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="p-20 text-center text-gray-400 italic">
                    No hay tickets con prioridad &quot;{filtroPrioridad}&quot;
                  </TableCell>
                </TableRow>
              ) : (
                ticketsOrdenados.map((ticket) => (
                  <TableRow
                    key={ticket.id}
                    className={`transition-all duration-300 border-none ${
                      ticket.status === "CLOSED" || ticket.status === "RESOLVED"
                        ? "bg-gray-50/50 text-gray-400"
                        : "bg-white hover:bg-blue-50/30 text-gray-900"
                    }`}
                  >
                    <TableCell className="p-4">
                      <div className="text-sm font-bold">
                        {ticket.profiles ? `${ticket.profiles.first_name} ${ticket.profiles.last_name}` : "Usuario Desconocido"}
                      </div>
                      <div className="text-[10px] opacity-70 font-medium lowercase">
                        {ticket.profiles?.email || "Sin correo"}
                      </div>
                    </TableCell>

                    <TableCell className="p-4 text-sm max-w-[250px]">
                      <div className="flex items-center gap-2">
                        <div className="font-bold tracking-tight truncate">
                          {ticket.title}
                        </div>
                        {ticket.priority === "URGENT" && (
                          <AlertCircle size={14} className="text-red-500 animate-pulse flex-shrink-0" />
                        )}
                      </div>
                      <div className="text-[11px] opacity-60 italic truncate">
                        {ticket.description}
                      </div>
                    </TableCell>

                    <TableCell className="p-4 text-center">
                      <Badge variant="outline" className={`rounded-full px-3 py-0.5 text-[10px] font-black uppercase tracking-wider ${getPriorityStyles(ticket.priority)}`}>
                        {priorityTranslations[ticket.priority?.toUpperCase()] || ticket.priority}
                      </Badge>
                    </TableCell>

                    <TableCell className="p-4 text-center">
                      <Select defaultValue={ticket.status} onValueChange={(val) => onStatusChange(ticket.id, val)} disabled={actualizandoId === ticket.id}>
                        <SelectTrigger className={`w-[130px] h-8 mx-auto rounded-full font-black text-[10px] uppercase tracking-tighter shadow-none transition-all ${getStatusStyles(ticket.status)}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="OPEN" className="text-[11px] font-bold text-green-600">ABIERTO</SelectItem>
                          <SelectItem value="IN_PROGRESS" className="text-[11px] font-bold text-blue-600">EN PROGRESO</SelectItem>
                          <SelectItem value="RESOLVED" className="text-[11px] font-bold text-purple-600">RESUELTO</SelectItem>
                          <SelectItem value="CLOSED" className="text-[11px] font-bold text-red-600">CERRADO</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>

                    <TableCell className="p-4 text-center text-[11px] font-mono font-medium opacity-60">
                      {new Date(ticket.created_at).toLocaleDateString()}
                    </TableCell>

                    <TableCell className="p-4 text-right">
                      {/* --- 3. CAMBIAMOS EL BOTÓN --- */}
                      {/* En lugar de window.confirm, solo guardamos el ID en el estado */}
                      <button
                        onClick={() => setTicketToDelete(ticket.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                        title="Eliminar ticket"
                      >
                        <Trash2 size={16} />
                      </button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* --- 4. NUESTRO MODAL PREMIUM --- */}
      {/* Si ticketToDelete tiene un ID, mostramos esto encima de toda la pantalla */}
      {ticketToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            
            <div className="p-6 text-center">
              <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="text-red-600" size={24} />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2">¿Eliminar ticket?</h3>
              <p className="text-slate-500 text-sm font-medium">
                Esta acción es definitiva. El ticket será borrado de la base de datos y no se podrá recuperar.
              </p>
            </div>

            <div className="bg-slate-50 p-4 flex gap-3">
              <button
                onClick={() => setTicketToDelete(null)}
                className="flex-1 px-4 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  onDelete(ticketToDelete);
                  setTicketToDelete(null); // Cerramos el modal
                }}
                className="flex-1 px-4 py-2.5 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-all shadow-md shadow-red-200"
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};