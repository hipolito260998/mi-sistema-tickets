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
  const [editingFirstName, setEditingFirstName] = useState<string>("");
  const [editingLastName, setEditingLastName] = useState<string>("");
  const [editingRole, setEditingRole] = useState<string>("");
  const [editingArea, setEditingArea] = useState<string>("");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creatingUser, setCreatingUser] = useState(false);
  const [newUser, setNewUser] = useState({
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    role: "CUSTOMER",
    area: "GENERAL"
  });

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
    setEditingFirstName(user.first_name || "");
    setEditingLastName(user.last_name || "");
    setEditingRole(user.role);
    setEditingArea(user.area || "GENERAL");
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingFirstName("");
    setEditingLastName("");
    setEditingRole("");
    setEditingArea("");
  };

  const saveChanges = async (userId: string) => {
    try {
      setSavingId(userId);
      console.log('[UserManagement] Guardando cambios para usuario:', userId);

      await Promise.all([
        userService.updateUserName(supabase, userId, editingFirstName, editingLastName),
        userService.updateUserRole(supabase, userId, editingRole as any),
        userService.updateUserArea(supabase, userId, editingArea),
      ]);

      console.log('[UserManagement] Cambios guardados exitosamente');
      
      setUsers(
        users.map((u) =>
          u.id === userId
            ? { ...u, first_name: editingFirstName, last_name: editingLastName, role: editingRole as any, area: editingArea }
            : u
        )
      );
      
      setEditingId(null);
      setEditingFirstName("");
      setEditingLastName("");
      setEditingRole("");
      setEditingArea("");
      
      await loadUsers();
    } catch (err: any) {
      console.error("Error guardando cambios:", err);
      alert(`Error al guardar: ${err?.message || "Error desconocido"}`);
    } finally {
      setSavingId(null);
    }
  };

  const createNewUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setCreatingUser(true);

      if (!newUser.email || !newUser.password || !newUser.first_name || !newUser.last_name) {
        alert("Por favor completa todos los campos");
        return;
      }

      if (newUser.password.length < 6) {
        alert("La contraseña debe tener al menos 6 caracteres");
        return;
      }

      const created = await userService.createUser(
        supabase,
        newUser.email,
        newUser.password,
        newUser.first_name,
        newUser.last_name,
        newUser.role as any,
        newUser.area
      );
      
      console.log('[UserManagement] Usuario creado exitosamente:', created);
      
      setUsers([...users, created]);
      setNewUser({
        email: "",
        password: "",
        first_name: "",
        last_name: "",
        role: "CUSTOMER",
        area: "GENERAL"
      });
      setShowCreateForm(false);
      alert(`Usuario ${created.email} creado exitosamente`);
    } catch (err: any) {
      console.error("Error creando usuario:", err);
      alert(`Error al crear usuario: ${err?.message || "Error desconocido"}`);
    } finally {
      setCreatingUser(false);
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
    <div className="w-full space-y-6">
      {/* Botón para crear nuevo usuario */}
      {!showCreateForm && (
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition"
        >
          + Crear Nuevo Usuario
        </button>
      )}

      {/* Formulario para crear usuario */}
      {showCreateForm && (
        <div className="bg-white p-6 rounded-xl border border-green-200 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-slate-900">Crear Nuevo Usuario</h3>
            <button
              onClick={() => setShowCreateForm(false)}
              className="text-slate-400 hover:text-slate-600 text-2xl leading-none"
            >
              ×
            </button>
          </div>

          <form onSubmit={createNewUser} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <input
                type="email"
                placeholder="Email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                className="px-3 py-2 rounded border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <input
                type="password"
                placeholder="Contraseña (mín 6 caracteres)"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                className="px-3 py-2 rounded border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <input
                type="text"
                placeholder="Nombre"
                value={newUser.first_name}
                onChange={(e) => setNewUser({ ...newUser, first_name: e.target.value })}
                className="px-3 py-2 rounded border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <input
                type="text"
                placeholder="Apellido"
                value={newUser.last_name}
                onChange={(e) => setNewUser({ ...newUser, last_name: e.target.value })}
                className="px-3 py-2 rounded border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <select
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                className="px-3 py-2 rounded border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {ROLES.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
              <select
                value={newUser.area}
                onChange={(e) => setNewUser({ ...newUser, area: e.target.value })}
                className="px-3 py-2 rounded border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {AREAS.map((area) => (
                  <option key={area} value={area}>
                    {area}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={creatingUser}
                className="bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-2 rounded font-semibold disabled:opacity-50"
              >
                {creatingUser ? "Creando..." : "Crear Usuario"}
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="bg-slate-300 hover:bg-slate-400 text-slate-800 text-sm px-4 py-2 rounded font-semibold"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tabla de usuarios */}
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
                    {editingId === user.id ? (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={editingFirstName}
                          onChange={(e) => setEditingFirstName(e.target.value)}
                          placeholder="Nombre"
                          className="px-2 py-1 rounded border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1"
                        />
                        <input
                          type="text"
                          value={editingLastName}
                          onChange={(e) => setEditingLastName(e.target.value)}
                          placeholder="Apellido"
                          className="px-2 py-1 rounded border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1"
                        />
                      </div>
                    ) : (
                      user.first_name && user.last_name
                        ? `${user.first_name} ${user.last_name}`
                        : "—"
                    )}
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
          <strong>Nota:</strong> Los cambios se guardan inmediatamente. Los usuarios deben recargar la página para ver los cambios reflejados.
        </p>
      </div>
    </div>
  );
}
