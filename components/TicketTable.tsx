// components/TicketTable.tsx
import { PriorityBadge } from "./ui/PriorityBadge";
import { StatusSelect } from "./ui/StatusSelect";

interface TicketTableProps {
  tickets: any[];
  actualizandoId: string | null;
  onStatusChange: (id: string, nuevoEstado: string) => void;
  filtroPrioridad: string;
}

export const TicketTable = ({ 
  tickets, 
  actualizandoId, 
  onStatusChange, 
  filtroPrioridad 
}: TicketTableProps) => {
  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-x-auto">
      <table className="w-full text-left min-w-200">
        <thead className="bg-gray-800 text-white text-[10px] uppercase tracking-widest">
          <tr>
            <th className="p-4">Usuario</th>
            <th className="p-4">Detalles</th>
            <th className="p-4 text-center">Prioridad</th>
            <th className="p-4 text-center">Estado</th>
            <th className="p-4 text-center">Fecha</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {tickets.length === 0 ? (
            <tr>
              <td colSpan={5} className="p-20 text-center text-gray-400 italic">
                No hay tickets con prioridad &quot;{filtroPrioridad}&quot;
              </td>
            </tr>
          ) : (
            tickets.map((ticket) => (
              <tr
                key={ticket.id}
                className={`transition-all duration-300 ${
                  ticket.status === "CLOSED" || ticket.status === "RESOLVED"
                    ? "bg-gray-100 text-gray-400"
                    : "bg-white hover:bg-blue-50/30 text-gray-900"
                }`}
              >
                <td className="p-4">
                  <div className="text-sm font-bold">{ticket.profiles?.first_name} {ticket.profiles?.last_name}</div>
                  <div className="text-[10px] opacity-70">{ticket.profiles?.email}</div>
                </td>
                <td className="p-4 text-sm">
                  <div className="font-bold">{ticket.title}</div>
                  <div className="text-xs opacity-60 italic line-clamp-1">{ticket.description}</div>
                </td>
                <td className="p-4 text-center">
                  <PriorityBadge priority={ticket.priority} />
                </td>
                <td className="p-4 text-center">
                  <StatusSelect
                    value={ticket.status}
                    disabled={actualizandoId === ticket.id}
                    onChange={(val) => onStatusChange(ticket.id, val)}
                  />
                </td>
                <td className="p-4 text-center text-[11px] font-mono opacity-60">
                  {new Date(ticket.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};