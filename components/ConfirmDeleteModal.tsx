import { AlertTriangle } from "lucide-react";

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
}

export const ConfirmDeleteModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "¿Eliminar ticket?",
  description = "Esta acción es definitiva. El ticket será borrado de la base de datos y no se podrá recuperar."
}: ConfirmDeleteModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-xl p-4 animate-in fade-in duration-200">
      <div className="bg-card rounded-3xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 border border-black/10 dark:border-white/10 relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-rose-500" />
        <div className="p-8 text-center relative z-10">
          <div className="mx-auto w-16 h-16 bg-rose-500/10 border border-rose-500/30 rounded-full flex items-center justify-center mb-6">
            <AlertTriangle className="text-rose-400" size={32} />
          </div>
          <h3 className="text-2xl font-black text-foreground mb-3 tracking-tight">{title}</h3>
          <p className="text-muted-foreground text-sm font-medium">
            {description}
          </p>
        </div>

        <div className="bg-black/5 dark:bg-white/5 p-4 flex gap-3 border-t border-black/10 dark:border-white/10">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 text-sm font-bold text-muted-foreground bg-transparent border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/10 hover:text-black dark:hover:text-white rounded-xl transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-3 text-sm font-bold text-rose-50 bg-rose-600 hover:bg-rose-500 rounded-xl transition-all"
          >
            Sí, eliminar
          </button>
        </div>
      </div>
    </div>
  );
};
