"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserProfile, userService } from "@/services/userService";
import { SupabaseClient } from "@supabase/supabase-js";
import { AlertCircle, AlertTriangle, CheckCircle, Trash2, UserPlus, XCircle, Info } from "lucide-react";
import { useEffect, useState } from "react";

const AREAS = ["DISEÑO", "SOPORTE", "DESARROLLO", "VENTAS", "MARKETING", "GENERAL"];
const ROLES = [
  { value: "CUSTOMER", label: "Cliente", color: "bg-blue-500/10 text-blue-400 border-blue-500/30 border" },
  { value: "AREA_LEAD", label: "Líder de Área", color: "bg-purple-500/10 text-purple-400 border-purple-500/30 border" },
  { value: "ADMIN", label: "Administrador", color: "bg-rose-500/10 text-rose-400 border-rose-500/30 border" },
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
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userToDelete.id);

      if (profileError) throw profileError;

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
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          <div className="text-muted-foreground font-medium text-sm tracking-widest uppercase">Cargando usuarios...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Botón para crear nuevo usuario */}
      <button
        onClick={() => setShowCreateForm(true)}
        className="bg-primary hover:bg-primary/90 text-primary-foreground font-black py-3 px-6 rounded-xl transition-all shadow-sm hover:scale-[1.02] active:scale-95 inline-flex items-center gap-2"
      >
        <UserPlus size={18} />
        Crear Nuevo Usuario
      </button>

      {/* MODAL para crear usuario */}
      {showCreateForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-xl p-4 animate-in fade-in duration-200">
          <div className="bg-background border border-white/10 rounded-3xl shadow-lg w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto relative">
            
            <div className="absolute top-0 left-0 w-full h-1 bg-primary" />
            
            <div className="p-6 text-center border-b border-white/5 relative z-10">
              <div className="mx-auto w-12 h-12 bg-primary/10 border border-primary/30 rounded-full flex items-center justify-center mb-4">
                <UserPlus className="text-primary" size={24} />
              </div>
              <h3 className="text-2xl font-black text-foreground mb-1 tracking-tight">Crear Nuevo Usuario</h3>
              <p className="text-sm text-muted-foreground font-medium">Ingresa los datos del nuevo usuario corporativo</p>
            </div>

            <form onSubmit={createNewUser} className="p-4 sm:p-6 space-y-4 relative z-10">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-muted-foreground mb-2 uppercase tracking-wide">Nombre</label>
                  <input
                    type="text"
                    value={newUser.first_name}
                    onChange={(e) => setNewUser({ ...newUser, first_name: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-black/10 dark:border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-foreground placeholder-black/30 dark:placeholder-white/20"
                    placeholder="Juan"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-muted-foreground mb-2 uppercase tracking-wide">Apellido</label>
                  <input
                    type="text"
                    value={newUser.last_name}
                    onChange={(e) => setNewUser({ ...newUser, last_name: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-black/10 dark:border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-foreground placeholder-black/30 dark:placeholder-white/20"
                    placeholder="Pérez"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-muted-foreground mb-2 uppercase tracking-wide">Correo Institucional</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-black/10 dark:border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-foreground placeholder-black/30 dark:placeholder-white/20"
                  placeholder="usuario@empresa.com"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-muted-foreground mb-2 uppercase tracking-wide">Contraseña</label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-black/10 dark:border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-foreground placeholder-black/30 dark:placeholder-white/20"
                  placeholder="••••••••"
                  required
                />
                <p className="text-[10px] text-muted-foreground/60 mt-1 font-medium">Debe tener al menos 6 caracteres</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-muted-foreground mb-2 uppercase tracking-wide">Rol</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-black/10 dark:border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-foreground font-medium"
                  >
                    {ROLES.map((role) => (
                      <option key={role.value} value={role.value} className="bg-background text-foreground">
                        {role.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-muted-foreground mb-2 uppercase tracking-wide">Área</label>
                  <select
                    value={newUser.area}
                    onChange={(e) => setNewUser({ ...newUser, area: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-black/10 dark:border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-foreground font-medium"
                  >
                    {AREAS.map((area) => (
                      <option key={area} value={area} className="bg-background text-foreground">
                        {area}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </form>

            <div className="bg-white/5 p-4 flex gap-3 border-t border-white/10 relative z-10">
              <button
                onClick={() => setShowCreateForm(false)}
                className="flex-1 px-4 py-3 text-sm font-bold text-muted-foreground bg-transparent border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/10 hover:text-black dark:hover:text-white rounded-xl transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={createNewUser}
                disabled={creatingUser}
                className="flex-1 px-4 py-3 text-sm font-bold text-primary-foreground bg-primary hover:bg-primary/90 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creatingUser ? "Creando..." : "Crear Usuario"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tabla de usuarios */}
      <div className="rounded-2xl border border-black/10 dark:border-white/10 shadow-sm overflow-hidden bg-card dark:bg-background/50 backdrop-blur-sm">
        <div className="overflow-x-auto pb-2">
          <table className="w-full min-w-[800px] text-sm">
            <thead className="bg-black/5 dark:bg-white/5 border-b border-black/10 dark:border-white/10">
              <tr>
                <th className="px-6 py-4 text-left font-black text-muted-foreground uppercase text-[10px] tracking-widest">
                  Email
                </th>
                <th className="px-6 py-4 text-left font-black text-muted-foreground uppercase text-[10px] tracking-widest">
                  Nombre
                </th>
                <th className="px-6 py-4 text-left font-black text-muted-foreground uppercase text-[10px] tracking-widest">
                  Rol
                </th>
                <th className="px-6 py-4 text-left font-black text-muted-foreground uppercase text-[10px] tracking-widest">
                  Área
                </th>
                <th className="px-6 py-4 text-right font-black text-muted-foreground uppercase text-[10px] tracking-widest">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="group border-b border-black/5 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors duration-300"
                >
                  <td className="px-6 py-4 text-foreground font-mono text-xs">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 text-foreground font-bold group-hover:text-primary transition-colors">
                    {editingId === user.id ? (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={editingFirstName}
                          onChange={(e) => setEditingFirstName(e.target.value)}
                          placeholder="Nombre"
                          className="px-3 py-1.5 rounded-lg border border-black/10 dark:border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-black/5 dark:bg-white/5 text-foreground flex-1"
                        />
                        <input
                          type="text"
                          value={editingLastName}
                          onChange={(e) => setEditingLastName(e.target.value)}
                          placeholder="Apellido"
                          className="px-3 py-1.5 rounded-lg border border-black/10 dark:border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-black/5 dark:bg-white/5 text-foreground flex-1"
                        />
                      </div>
                    ) : (
                      user.first_name && user.last_name
                        ? `${user.first_name} ${user.last_name}`
                        : <span className="text-muted-foreground font-normal">S/N</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {editingId === user.id ? (
                      <select
                        value={editingRole}
                        onChange={(e) => setEditingRole(e.target.value)}
                        className="px-3 py-1.5 rounded-lg border border-black/10 dark:border-white/10 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary bg-black/5 dark:bg-white/5 text-foreground"
                      >
                        {ROLES.map((role) => (
                          <option key={role.value} value={role.value} className="bg-background text-foreground">
                            {role.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <Badge
                        className={`rounded-full px-3 py-0.5 text-[10px] font-black uppercase tracking-widest ${
                          ROLES.find((r) => r.value === user.role)?.color
                        }`}
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
                        className="px-3 py-1.5 rounded-lg border border-black/10 dark:border-white/10 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary bg-black/5 dark:bg-white/5 text-foreground"
                      >
                        {AREAS.map((area) => (
                          <option key={area} value={area} className="bg-background text-foreground">
                            {area}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <Badge variant="outline" className="rounded-full px-3 py-0.5 text-[10px] font-black uppercase tracking-widest bg-black/5 dark:bg-white/5 text-muted-foreground border-black/10 dark:border-white/10">
                        {user.area || "GENERAL"}
                      </Badge>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {editingId === user.id ? (
                      <div className="flex gap-2 justify-end">
                        <Button
                          onClick={() => saveChanges(user.id)}
                          disabled={savingId === user.id}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-4 py-1.5 rounded-lg font-bold"
                        >
                          {savingId === user.id ? "Guardando..." : "Guardar"}
                        </Button>
                        <Button
                          onClick={cancelEditing}
                          className="bg-transparent hover:bg-black/10 dark:hover:bg-white/10 border border-black/10 dark:border-white/10 text-muted-foreground hover:text-foreground text-xs px-4 py-1.5 rounded-lg font-bold"
                        >
                          Cancelar
                        </Button>
                      </div>
                    ) : (
                      <div className="flex gap-2 justify-end">
                        <Button
                          onClick={() => startEditing(user)}
                          className="bg-transparent hover:bg-primary/20 text-primary border border-primary/30 text-xs px-4 py-1.5 rounded-lg font-bold transition-all"
                        >
                          Editar
                        </Button>
                        <button
                          onClick={() => setUserToDelete({ id: user.id, email: user.email })}
                          className="p-2 text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 rounded-full transition-all duration-200"
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
          <p className="text-muted-foreground font-medium">No hay usuarios para mostrar.</p>
        </div>
      )}

      <div className="mt-4 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-start gap-3">
        <Info size={20} className="text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
        <p className="text-sm text-blue-800 dark:text-blue-300 font-medium leading-relaxed">
          <span className="font-bold text-blue-900 dark:text-blue-400">NOTA:</span> Los cambios se guardan inmediatamente en la base de datos. Los usuarios deben recargar la página para ver sus nuevos permisos reflejados.
        </p>
      </div>

      {/* MODAL DE ÉXITO */}
      {successModal.show && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-background/80 backdrop-blur-xl p-4 animate-in fade-in duration-200">
          <div className="bg-card rounded-3xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 border border-black/10 dark:border-white/10 relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500" />
            <div className="p-8 text-center relative z-10">
              <div className="mx-auto w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center mb-6">
                <CheckCircle className="text-emerald-400" size={32} />
              </div>
              <h3 className="text-2xl font-black text-foreground mb-3 tracking-tight">¡Éxito!</h3>
              <p className="text-muted-foreground text-sm font-medium">
                {successModal.message}
              </p>
            </div>
            <div className="bg-black/5 dark:bg-white/5 p-4 flex gap-3 border-t border-black/10 dark:border-white/10 relative z-10">
              <button
                onClick={() => setSuccessModal({ show: false, message: "" })}
                className="w-full px-4 py-3 text-sm font-bold text-emerald-50 bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-all"
              >
                Continuar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE ERROR */}
      {errorModal.show && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-background/80 backdrop-blur-xl p-4 animate-in fade-in duration-200">
          <div className="bg-card rounded-3xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 border border-black/10 dark:border-white/10 relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-rose-500" />
            <div className="p-8 text-center relative z-10">
              <div className="mx-auto w-16 h-16 bg-rose-500/10 border border-rose-500/30 rounded-full flex items-center justify-center mb-6">
                <XCircle className="text-rose-400" size={32} />
              </div>
              <h3 className="text-2xl font-black text-foreground mb-3 tracking-tight">Error</h3>
              <p className="text-muted-foreground text-sm font-medium">
                {errorModal.message}
              </p>
            </div>
            <div className="bg-black/5 dark:bg-white/5 p-4 flex gap-3 border-t border-black/10 dark:border-white/10 relative z-10">
              <button
                onClick={() => setErrorModal({ show: false, message: "" })}
                className="w-full px-4 py-3 text-sm font-bold text-rose-50 bg-rose-600 hover:bg-rose-500 rounded-xl transition-all"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE VALIDACIÓN */}
      {validationModal.show && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-background/80 backdrop-blur-xl p-4 animate-in fade-in duration-200">
          <div className="bg-card rounded-3xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 border border-black/10 dark:border-white/10 relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-amber-500" />
            <div className="p-8 text-center relative z-10">
              <div className="mx-auto w-16 h-16 bg-amber-500/10 border border-amber-500/30 rounded-full flex items-center justify-center mb-6">
                <AlertCircle className="text-amber-400" size={32} />
              </div>
              <h3 className="text-xl font-black text-foreground mb-3 tracking-tight">Campos Incompletos</h3>
              <p className="text-muted-foreground text-sm font-medium">
                {validationModal.message}
              </p>
            </div>
            <div className="bg-black/5 dark:bg-white/5 p-4 flex gap-3 border-t border-black/10 dark:border-white/10 relative z-10">
              <button
                onClick={() => setValidationModal({ show: false, message: "" })}
                className="w-full px-4 py-3 text-sm font-bold text-amber-50 bg-amber-600 hover:bg-amber-500 rounded-xl transition-all"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMACIÓN DE ELIMINACIÓN DE USUARIO */}
      {userToDelete && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-background/80 backdrop-blur-xl p-4 animate-in fade-in duration-200">
          <div className="bg-card rounded-3xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 border border-black/10 dark:border-white/10 relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-rose-500" />
            <div className="p-8 text-center relative z-10">
              <div className="mx-auto w-16 h-16 bg-rose-500/10 border border-rose-500/30 rounded-full flex items-center justify-center mb-6">
                <AlertTriangle className="text-rose-400" size={32} />
              </div>
              <h3 className="text-2xl font-black text-foreground mb-3 tracking-tight">¿Eliminar Usuario?</h3>
              <p className="text-muted-foreground text-sm font-medium">
                Se eliminará a <span className="font-bold text-foreground">{userToDelete.email}</span>. Esta acción es irreversible.
              </p>
            </div>
            <div className="bg-black/5 dark:bg-white/5 p-4 flex gap-3 border-t border-black/10 dark:border-white/10 relative z-10">
              <button
                onClick={() => setUserToDelete(null)}
                className="flex-1 px-4 py-3 text-sm font-bold text-muted-foreground bg-transparent border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/10 hover:text-black dark:hover:text-white rounded-xl transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={deleteUser}
                disabled={deletingUser}
                className="flex-1 px-4 py-3 text-sm font-bold text-rose-50 bg-rose-600 hover:bg-rose-500 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
