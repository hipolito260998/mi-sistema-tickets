"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserProfile, userService } from "@/services/userService";
import { SupabaseClient } from "@supabase/supabase-js";
import { AlertCircle, AlertTriangle, CheckCircle, Trash2, UserPlus, XCircle } from "lucide-react";
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
  const [successModal, setSuccessModal] = useState<{ show: boolean; message: string }>({ show: false, message: "" });
  const [errorModal, setErrorModal] = useState<{ show: boolean; message: string }>({ show: false, message: "" });
  const [validationModal, setValidationModal] = useState<{ show: boolean; message: string }>({ show: false, message: "" });
  const [userToDelete, setUserToDelete] = useState<{ id: string; email: string } | null>(null);
  const [deletingUser, setDeletingUser] = useState(false);
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
      setErrorModal({ show: true, message: `Error al guardar: ${err?.message || "Error desconocido"}` });
    } finally {
      setSavingId(null);
    }
  };

  const createNewUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setCreatingUser(true);

      if (!newUser.email || !newUser.password || !newUser.first_name || !newUser.last_name) {
        setValidationModal({ show: true, message: "Por favor completa todos los campos" });
        setCreatingUser(false);
        return;
      }

      if (newUser.password.length < 6) {
        setValidationModal({ show: true, message: "La contraseña debe tener al menos 6 caracteres" });
        setCreatingUser(false);
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
      setSuccessModal({ show: true, message: `Usuario ${created.email} creado exitosamente` });
    } catch (err: any) {
      console.error("Error creando usuario:", err);
      setErrorModal({ show: true, message: `Error al crear usuario: ${err?.message || "Error desconocido"}` });
    } finally {
      setCreatingUser(false);
    }
  };

  const deleteUser = async () => {
    if (!userToDelete) return;

    try {
      setDeletingUser(true);

      // Primero, eliminar del directorio de autenticación via admin API (si es posible)
      // Para esto, usamos la función RPC o eliminamos directamente del perfil
      
      // Eliminar de la tabla profiles
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userToDelete.id);

      if (profileError) throw profileError;

      // Actualizar la lista local
      setUsers(users.filter(u => u.id !== userToDelete.id));
      setUserToDelete(null);
      setSuccessModal({ show: true, message: `Usuario ${userToDelete.email} eliminado exitosamente` });
    } catch (err: any) {
      console.error("Error eliminando usuario:", err);
      setErrorModal({ show: true, message: `Error al eliminar usuario: ${err?.message || "Error desconocido"}` });
    } finally {
      setDeletingUser(false);
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
      <button
        onClick={() => setShowCreateForm(true)}
        className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition inline-flex items-center gap-2"
      >
        <UserPlus size={18} />
        Crear Nuevo Usuario
      </button>

      {/* MODAL para crear usuario */}
      {showCreateForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            
            {/* Encabezado del modal */}
            <div className="p-6 text-center border-b border-slate-100 bg-gradient-to-r from-green-50 to-blue-50">
              <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <UserPlus className="text-green-600" size={24} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-1">Crear Nuevo Usuario</h3>
              <p className="text-sm text-slate-500">Ingresa los datos del nuevo usuario</p>
            </div>

            {/* Contenido del formulario */}
            <form onSubmit={createNewUser} className="p-6 space-y-4">
              {/* Nombre y Apellido */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-2 uppercase tracking-wide">Nombre</label>
                  <input
                    type="text"
                    placeholder="Juan"
                    value={newUser.first_name}
                    onChange={(e) => setNewUser({ ...newUser, first_name: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition bg-slate-50 hover:bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-2 uppercase tracking-wide">Apellido</label>
                  <input
                    type="text"
                    placeholder="Pérez"
                    value={newUser.last_name}
                    onChange={(e) => setNewUser({ ...newUser, last_name: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition bg-slate-50 hover:bg-white"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-black text-slate-700 mb-2 uppercase tracking-wide">Correo Electrónico</label>
                <input
                  type="email"
                  placeholder="juan.perez@example.com"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition bg-slate-50 hover:bg-white"
                  required
                />
              </div>

              {/* Contraseña */}
              <div>
                <label className="block text-xs font-black text-slate-700 mb-2 uppercase tracking-wide">Contraseña</label>
                <input
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition bg-slate-50 hover:bg-white"
                  required
                />
                <p className="text-[10px] text-slate-400 mt-1">Debe tener al menos 6 caracteres</p>
              </div>

              {/* Rol y Área */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-2 uppercase tracking-wide">Rol</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition bg-slate-50 hover:bg-white font-medium"
                  >
                    {ROLES.map((role) => (
                      <option key={role.value} value={role.value}>
                        {role.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-2 uppercase tracking-wide">Área</label>
                  <select
                    value={newUser.area}
                    onChange={(e) => setNewUser({ ...newUser, area: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition bg-slate-50 hover:bg-white font-medium"
                  >
                    {AREAS.map((area) => (
                      <option key={area} value={area}>
                        {area}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </form>

            {/* Botones de acción */}
            <div className="bg-slate-50 p-4 flex gap-3 border-t border-slate-100">
              <button
                onClick={() => setShowCreateForm(false)}
                className="flex-1 px-4 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition-all duration-200"
              >
                Cancelar
              </button>
              <button
                onClick={createNewUser}
                disabled={creatingUser}
                className="flex-1 px-4 py-2.5 text-sm font-bold text-white bg-green-600 hover:bg-green-700 rounded-xl transition-all duration-200 shadow-md shadow-green-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creatingUser ? "Creando..." : "Crear Usuario"}
              </button>
            </div>
          </div>
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
                      <div className="flex gap-2 justify-end">
                        <Button
                          onClick={() => startEditing(user)}
                          className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1.5 rounded"
                        >
                          Editar
                        </Button>
                        <button
                          onClick={() => setUserToDelete({ id: user.id, email: user.email })}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                          title="Eliminar usuario"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
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

      {/* MODAL DE ÉXITO */}
      {successModal.show && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="text-green-600" size={24} />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2">¡Éxito!</h3>
              <p className="text-slate-600 text-sm font-medium mb-6">
                {successModal.message}
              </p>
            </div>
            <div className="bg-slate-50 p-4 flex gap-3 border-t border-slate-100">
              <button
                onClick={() => setSuccessModal({ show: false, message: "" })}
                className="w-full px-4 py-2.5 text-sm font-bold text-white bg-green-600 hover:bg-green-700 rounded-xl transition-all shadow-md shadow-green-200"
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE ERROR */}
      {errorModal.show && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <XCircle className="text-red-600" size={24} />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2">Error</h3>
              <p className="text-slate-600 text-sm font-medium mb-6">
                {errorModal.message}
              </p>
            </div>
            <div className="bg-slate-50 p-4 flex gap-3 border-t border-slate-100">
              <button
                onClick={() => setErrorModal({ show: false, message: "" })}
                className="w-full px-4 py-2.5 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-all shadow-md shadow-red-200"
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE VALIDACIÓN */}
      {validationModal.show && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="mx-auto w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="text-amber-600" size={24} />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2">Campos Incompletos</h3>
              <p className="text-slate-600 text-sm font-medium mb-6">
                {validationModal.message}
              </p>
            </div>
            <div className="bg-slate-50 p-4 flex gap-3 border-t border-slate-100">
              <button
                onClick={() => setValidationModal({ show: false, message: "" })}
                className="w-full px-4 py-2.5 text-sm font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl transition-all shadow-md shadow-amber-200"
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMACIÓN DE ELIMINACIÓN DE USUARIO */}
      {userToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="text-red-600" size={24} />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2">¿Eliminar Usuario?</h3>
              <p className="text-slate-600 text-sm font-medium mb-6">
                Esta acción eliminará a <span className="font-bold">{userToDelete.email}</span> de la base de datos. Esta acción es irreversible.
              </p>
            </div>
            <div className="bg-slate-50 p-4 flex gap-3 border-t border-slate-100">
              <button
                onClick={() => setUserToDelete(null)}
                className="flex-1 px-4 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={deleteUser}
                disabled={deletingUser}
                className="flex-1 px-4 py-2.5 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-all shadow-md shadow-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deletingUser ? "Eliminando..." : "Sí, eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
