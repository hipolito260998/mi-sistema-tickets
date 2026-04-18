"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserProfile, userService } from "@/services/userService";
import { SupabaseClient } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

const AREAS = ["DISEÑO", "SOPORTE", "DESARROLLO", "VENTAS", "MARKETING", "GENERAL"];
const ROLES = [
  { value: "CUSTOMER", label: "Cliente", color: "bg-blue-100 text-blue-800" },
  { value: "AREA_LEAD", label: "Líder de Área", color: "bg-purple-100 text-purple-800" },
  { value: "ADMIN", label: "Administrador", color: "bg-red-100 text-red-800" },
];

interface UserManagementProps {
  supabase: SupabaseClient;
}

export function UserManagement({ supabase }: UserManagementProps) {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingRole, setEditingRole] = useState<string>("");
  const [editingArea, setEditingArea] = useState<string>("");
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getAllUsers(supabase);
      setUsers(data);
    } catch (err) {
      console.error("Error cargando usuarios:", err);
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (user: UserProfile) => {
    setEditingId(user.id);
    setEditingRole(user.role);
    setEditingArea(user.area || "GENERAL");
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingRole("");
    setEditingArea("");
  };

  const saveChanges = async (userId: string) => {
    try {
      setSavingId(userId);
      await Promise.all([
        userService.updateUserRole(supabase, userId, editingRole as any),
        userService.updateUserArea(supabase, userId, editingArea),
      ]);
      
      setUsers(
        users.map((u) =>
          u.id === userId
            ? { ...u, role: editingRole as any, area: editingArea }
            : u
        )
      );
      
      setEditingId(null);
      setEditingRole("");
      setEditingArea("");
    } catch (err) {
      console.error("Error guardando cambios:", err);
      alert("Error al guardar los cambios");
    } finally {
      setSavingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-slate-500">Cargando usuarios...</div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-3 text-left font-semibold text-slate-700">
                  Email
                </th>
                <th className="px-6 py-3 text-left font-semibold text-slate-700">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left font-semibold text-slate-700">
                  Rol
                </th>
                <th className="px-6 py-3 text-left font-semibold text-slate-700">
                  Área
                </th>
                <th className="px-6 py-3 text-right font-semibold text-slate-700">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                >
                  <td className="px-6 py-4 text-slate-900 font-medium">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {user.first_name && user.last_name
                      ? `${user.first_name} ${user.last_name}`
                      : "—"}
                  </td>
                  <td className="px-6 py-4">
                    {editingId === user.id ? (
                      <select
                        value={editingRole}
                        onChange={(e) => setEditingRole(e.target.value)}
                        className="px-3 py-1 rounded border border-slate-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {ROLES.map((role) => (
                          <option key={role.value} value={role.value}>
                            {role.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <Badge
                        className={`${
                          ROLES.find((r) => r.value === user.role)?.color
                        } border-none text-xs font-semibold`}
                      >
                        {ROLES.find((r) => r.value === user.role)?.label}
                      </Badge>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {editingId === user.id ? (
                      <select
                        value={editingArea}
                        onChange={(e) => setEditingArea(e.target.value)}
                        className="px-3 py-1 rounded border border-slate-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {AREAS.map((area) => (
                          <option key={area} value={area}>
                            {area}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <Badge className="bg-slate-100 text-slate-800 border-none">
                        {user.area || "GENERAL"}
                      </Badge>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {editingId === user.id ? (
                      <div className="flex gap-2 justify-end">
                        <Button
                          onClick={() =>
                            saveChanges(user.id)
                          }
                          disabled={savingId === user.id}
                          className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1.5 rounded"
                        >
                          {savingId === user.id ? "Guardando..." : "Guardar"}
                        </Button>
                        <Button
                          onClick={cancelEditing}
                          className="bg-slate-300 hover:bg-slate-400 text-slate-800 text-xs px-3 py-1.5 rounded"
                        >
                          Cancelar
                        </Button>
                      </div>
                    ) : (
                      <Button
                        onClick={() => startEditing(user)}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1.5 rounded"
                      >
                        Editar
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {users.length === 0 && (
        <div className="text-center py-12">
          <p className="text-slate-500">No hay usuarios para mostrar</p>
        </div>
      )}

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-900">
          <strong>Nota:</strong> Cambiar el rol y área de un usuario requiere que recargue la página para ver los cambios reflejados en su dashboard.
        </p>
      </div>
    </div>
  );
}
