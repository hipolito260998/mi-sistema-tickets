import { ConfirmDeleteModal } from "@/components/ConfirmDeleteModal";
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
import { Ticket, TicketPriority, TicketStatus } from "@/types/ticket";
import { Inbox, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

interface TicketTableProps {
  tickets: Ticket[];
  actualizandoId: string | null;
  onStatusChange: (id: string, newStatus: TicketStatus) => Promise<void>;
  filtroPrioridad: string;
  onDelete: (id: string) => Promise<void>;
}

const statusPriority: Record<TicketStatus, number> = {
  OPEN: 1,
  IN_PROGRESS: 2,
  RESOLVED: 3,
  CLOSED: 4,
};

export const TicketTable = ({
  tickets,
  actualizandoId,
  onStatusChange,
  filtroPrioridad,
  onDelete,
}: TicketTableProps) => {
  const [ticketAEliminar, setTicketAEliminar] = useState<Ticket | null>(null);

  const getStatusStyles = (status: TicketStatus) => {
    switch (status) {
      case "OPEN":
        return "bg-amber-500/10 text-amber-400 border-amber-500/30";
      case "IN_PROGRESS":
        return "bg-blue-500/10 text-blue-400 border-blue-500/30";
      case "RESOLVED":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
      case "CLOSED":
        return "bg-slate-500/10 text-slate-400 border-slate-500/30";
      default:
        return "bg-slate-500/10 text-slate-400 border-slate-500/30";
    }
  };

  const getPriorityStyles = (priority: TicketPriority) => {
    switch (priority) {
      case "URGENT":
        return "bg-rose-500/20 text-rose-400 border-rose-500/30 font-bold";
      case "HIGH":
        return "bg-orange-500/10 text-orange-400 border-orange-500/30";
      case "MEDIUM":
        return "bg-blue-500/10 text-blue-400 border-blue-500/30";
      case "LOW":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
      default:
        return "bg-slate-500/10 text-slate-400 border-slate-500/30";
    }
  };

  const priorityTranslations: Record<TicketPriority, string> = {
    URGENT: "Urgente",
    HIGH: "Alta",
    MEDIUM: "Media",
    LOW: "Baja",
  };

  const ticketsOrdenados = useMemo(() => {
    return [...tickets].sort((a, b) => {
      if (statusPriority[a.status] !== statusPriority[b.status]) {
        return statusPriority[a.status] - statusPriority[b.status];
      }
      return (
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    });
  }, [tickets]);

  return (
    <>
      <div className="relative h-full flex flex-col">
        <div className="flex-1 overflow-auto">
          <Table>
            <TableHeader className="bg-black/5 dark:bg-white/5 sticky top-0 z-10 backdrop-blur-md shadow-sm border-b border-black/10 dark:border-white/10">
              <TableRow className="hover:bg-transparent border-none">
                <TableHead className="w-[100px] font-black text-muted-foreground uppercase text-[10px] tracking-widest pl-6">ID</TableHead>
                <TableHead className="font-black text-muted-foreground uppercase text-[10px] tracking-widest">Asunto</TableHead>
                <TableHead className="font-black text-muted-foreground uppercase text-[10px] tracking-widest">Cliente</TableHead>
                <TableHead className="font-black text-muted-foreground uppercase text-[10px] tracking-widest text-center">Prioridad</TableHead>
                <TableHead className="font-black text-muted-foreground uppercase text-[10px] tracking-widest text-center">Estado</TableHead>
                <TableHead className="font-black text-muted-foreground uppercase text-[10px] tracking-widest text-center">Fecha</TableHead>
                <TableHead className="text-right pr-6 font-black text-muted-foreground uppercase text-[10px] tracking-widest w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ticketsOrdenados.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-[400px] text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground gap-4">
                      <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                        <Inbox size={32} />
                      </div>
                      <p className="font-medium text-lg">No hay tickets {filtroPrioridad !== "TODOS" ? "con esta prioridad" : "disponibles"}.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                ticketsOrdenados.map((ticket) => (
                  <TableRow 
                    key={ticket.id} 
                    className="group border-b border-black/5 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors duration-300"
                  >
                    <TableCell className="font-mono text-xs text-muted-foreground pl-6">
                      #{ticket.id.substring(0, 6)}
                    </TableCell>
                    
                    <TableCell>
                      <div className="font-bold text-foreground group-hover:text-primary transition-colors">
                        {ticket.title}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      {ticket.profiles && (
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-foreground">
                            {Array.isArray(ticket.profiles)
                              ? `${ticket.profiles[0]?.first_name} ${ticket.profiles[0]?.last_name}`
                              : `${ticket.profiles.first_name} ${ticket.profiles.last_name}`}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {Array.isArray(ticket.profiles)
                              ? ticket.profiles[0]?.email
                              : ticket.profiles.email}
                          </span>
                        </div>
                      )}
                    </TableCell>
                    
                    <TableCell className="p-4 text-center">
                      <Badge variant="outline" className={`rounded-full px-3 py-0.5 text-[10px] font-black uppercase tracking-widest border ${getPriorityStyles(ticket.priority)}`}>
                        {priorityTranslations[ticket.priority] || ticket.priority}
                      </Badge>
                    </TableCell>
                    
                    <TableCell className="p-4 text-center">
                      <Select
                        value={ticket.status}
                        onValueChange={(val) => onStatusChange(ticket.id, val as TicketStatus)}
                        disabled={actualizandoId === ticket.id}
                      >
                        <SelectTrigger className={`w-[130px] mx-auto h-8 text-xs font-bold rounded-full border focus:ring-0 ${getStatusStyles(ticket.status)} transition-all hover:brightness-110`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-background border-white/10 shadow-2xl rounded-xl">
                          <SelectItem value="OPEN" className="font-bold text-amber-400 focus:bg-amber-400/10 focus:text-amber-300">Abierto</SelectItem>
                          <SelectItem value="IN_PROGRESS" className="font-bold text-blue-400 focus:bg-blue-400/10 focus:text-blue-300">En Proceso</SelectItem>
                          <SelectItem value="RESOLVED" className="font-bold text-emerald-400 focus:bg-emerald-400/10 focus:text-emerald-300">Resuelto</SelectItem>
                          <SelectItem value="CLOSED" className="font-bold text-slate-400 focus:bg-slate-400/10 focus:text-slate-300">Cerrado</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    
                    <TableCell className="text-muted-foreground text-xs font-medium text-center">
                      {new Date(ticket.created_at).toLocaleDateString()}
                    </TableCell>

                    <TableCell className="text-right pr-6">
                      <button
                        onClick={() => setTicketAEliminar(ticket)}
                        disabled={actualizandoId === ticket.id}
                        className="p-2 text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 rounded-full transition-all disabled:opacity-50"
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

      <ConfirmDeleteModal 
        isOpen={!!ticketAEliminar}
        onClose={() => setTicketAEliminar(null)}
        onConfirm={async () => {
          if (ticketAEliminar) {
            await onDelete(ticketAEliminar.id);
            setTicketAEliminar(null);
          }
        }}
      />
    </>
  );
};