"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { createClient } from "@/utils/supabase/client";
import { Lock, ShieldCheck } from "lucide-react";

const updatePasswordSchema = z.object({
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

type UpdatePasswordData = z.infer<typeof updatePasswordSchema>;

export default function UpdatePassword() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    // Failsafe: Forzar el inicio de sesión leyendo los tokens directamente de la URL
    // Esto resuelve el problema de "Auth session missing" si Supabase no lee el hash a tiempo
    if (typeof window !== "undefined" && window.location.hash) {
      const params = new URLSearchParams(window.location.hash.substring(1));
      const access_token = params.get("access_token");
      const refresh_token = params.get("refresh_token");
      
      if (access_token && refresh_token) {
        supabase.auth.setSession({
          access_token,
          refresh_token
        }).then(({ error }) => {
          if (error) console.error("Error setting session manually:", error);
          else {
             // Limpiar la URL por seguridad (opcional, pero buena práctica)
             window.history.replaceState(null, '', window.location.pathname);
          }
        });
      }
    }
  }, [supabase]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdatePasswordData>({
    resolver: zodResolver(updatePasswordSchema),
  });

  const onSubmit = async (data: UpdatePasswordData) => {
    setLoading(true);
    
    // Al haber entrado por el link de recuperación, ya hay una sesión activa de Supabase
    const { error } = await supabase.auth.updateUser({
      password: data.password
    });

    if (error) {
      toast.error(error.message || "Error al actualizar la contraseña");
      setLoading(false);
    } else {
      toast.success("Contraseña actualizada con éxito.");
      // Usamos window.location.href en lugar de router.push para forzar un Hard Reload
      // y que el Navbar (Server Component) detecte las nuevas cookies de sesión.
      setTimeout(() => {
        window.location.href = "/";
      }, 800);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-950 font-sans p-6 relative overflow-hidden">
      {/* Fondo con patrón sutil */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      
      <div className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl relative z-10 animate-in fade-in zoom-in-95 duration-500">
        
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center mb-4 border border-primary/30">
            <ShieldCheck className="text-primary w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">Nueva Contraseña</h2>
          <p className="text-slate-400 text-sm mt-2 text-center">
            Establece tu nueva contraseña corporativa.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wide">
              Nueva Contraseña
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-4 w-4 text-slate-500" />
              </div>
              <input
                type="password"
                {...register("password")}
                className="w-full pl-10 pr-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-colors text-white placeholder:text-slate-600 text-sm"
                placeholder="••••••••"
              />
            </div>
            {errors.password && (
              <p className="text-rose-400 text-xs font-medium">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wide">
              Confirmar Contraseña
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-4 w-4 text-slate-500" />
              </div>
              <input
                type="password"
                {...register("confirmPassword")}
                className="w-full pl-10 pr-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-colors text-white placeholder:text-slate-600 text-sm"
                placeholder="••••••••"
              />
            </div>
            {errors.confirmPassword && (
              <p className="text-rose-400 text-xs font-medium">{errors.confirmPassword.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl font-bold text-primary-foreground bg-primary hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/25 disabled:opacity-50 flex justify-center mt-4"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Actualizando...
              </span>
            ) : (
              "Actualizar y Entrar"
            )}
          </button>
        </form>

      </div>
    </main>
  );
}
