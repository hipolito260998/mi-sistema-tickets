interface Props {
  value: string;
  disabled?: boolean;
  onChange: (newValue: string) => void;
}

export const StatusSelect = ({ value, disabled, onChange }: Props) => {
  const styles: Record<string, string> = {
    OPEN: "bg-yellow-100 text-yellow-800 border-yellow-300",
    IN_PROGRESS: "bg-blue-100 text-blue-800 border-blue-300",
    RESOLVED: "bg-green-100 text-green-800 border-green-300",
    CLOSED: "bg-red-100 text-red-800 border-red-300",
  };

  return (
    <select
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      className={`text-[10px] font-bold rounded-lg px-2 py-1 border outline-none cursor-pointer transition-all ${styles[value]}`}
    >
      <option value="OPEN">Abierto</option>
      <option value="IN_PROGRESS">En Progreso</option>
      <option value="RESOLVED">Resuelto</option>
      <option value="CLOSED">Cerrado</option>
    </select>
  );
};