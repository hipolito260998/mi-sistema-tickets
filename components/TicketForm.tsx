"use client";
import { useState } from "react";

interface Props {
  onSubmit: (data: { title: string; description: string; priority: string }) => Promise<void>;
}

export const TicketForm = ({ onSubmit }: Props) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [enviando, setEnviando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnviando(true);
    await onSubmit({ title, description, priority });
    setTitle("");
    setDescription("");
    setEnviando(false);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 space-y-4">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Crear Nuevo Ticket</h2>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Asunto</label>
        <input 
          required value={title} onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          placeholder="Ej: Mi monitor no enciende"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
        <textarea 
          required value={description} onChange={(e) => setDescription(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none h-24"
          placeholder="Cuéntanos más detalles..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Prioridad</label>
        <select 
          value={priority} onChange={(e) => setPriority(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-bold"
        >
          <option value="LOW">Baja</option>
          <option value="MEDIUM">Media</option>
          <option value="HIGH">Alta</option>
          <option value="URGENT">Urgente</option>
        </select>
      </div>

      <button 
        type="submit" disabled={enviando}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50"
      >
        {enviando ? "Enviando..." : "Enviar Ticket"}
      </button>
    </form>
  );
};