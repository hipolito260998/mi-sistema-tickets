interface Props {
  priority: string;
}

export const PriorityBadge = ({ priority }: Props) => {
  // Definimos los estilos en un objeto para que sea fácil de mantener (SOLID)
  const styles: Record<string, string> = {
    URGENT: "bg-red-100 text-red-700 border-red-700",
    HIGH: "bg-orange-500 text-white border-orange-600",
    MEDIUM: "bg-blue-100 text-blue-700 border-blue-200",
    LOW: "bg-emerald-100 text-emerald-700 border-emerald-200",
  };

  return (
    <span className={`min-w-20 px-2 py-1 rounded-full text-[10px] font-black uppercase border text-center inline-block ${styles[priority] || "bg-gray-100 text-gray-600"}`}>
      {priority}
    </span>
  );
};