"use client";

import { loginAction } from "@/actions/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Building2, Command, Lock, Mail, ShieldCheck } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

const authSchema = z.object({
  email: z.string().email("Correo electrónico inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

type AuthFormData = z.infer<typeof authSchema>;

export default function Login() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [currentTip, setCurrentTip] = useState(0);

  const tips = [
    {
      title: "Seguridad ante todo",
      text: "Nunca compartas tu contraseña. Nuestro equipo de soporte nunca te pedirá tus credenciales de acceso.",
      image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=400&h=250"
    },
    {
      title: "Actualizaciones al día",
      text: "Reinicia tu equipo al menos una vez por semana para asegurar la instalación de parches críticos de seguridad.",
      image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=400&h=250"
    },
    {
      title: "Prevención de Phishing",
      text: "Verifica siempre la dirección del remitente antes de abrir enlaces o descargar archivos adjuntos sospechosos.",
      image: "https://images.unsplash.com/photo-1562813733-b31f71025d54?auto=format&fit=crop&q=80&w=400&h=250"
    },
    {
      title: "Protege tu estación",
      text: "Bloquea tu pantalla siempre que te alejes de tu lugar de trabajo para prevenir accesos no autorizados.",
      image: "https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?auto=format&fit=crop&q=80&w=400&h=250"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % tips.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AuthFormData>({
    resolver: zodResolver(authSchema),
  });

  const onSubmit = async (data: AuthFormData) => {
    setLoading(true);
    const formData = new FormData();
    formData.append("email", data.email);
    formData.append("password", data.password);

    const res = await loginAction(formData);
    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success("Inicio de sesión exitoso");
      const destino = res?.role === "ADMIN" ? "/dashboard" : "/";
      router.push(destino);
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen flex flex-col md:flex-row font-sans selection:bg-primary/30">
      
      {/* Lado Izquierdo - Visual Corporativo */}
      <div className="hidden md:flex flex-col justify-between w-1/2 bg-slate-950 border-r border-black/10 dark:border-white/5 relative overflow-hidden p-12">
        {/* Fondo sutil */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

        <div className="relative z-10 flex flex-col justify-center items-center h-full w-full">
          <div className="w-full max-w-lg bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl relative min-h-[450px] flex flex-col">
            
            {/* Carousel items */}
            <div className="relative flex-1">
              {tips.map((tip, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 flex flex-col transition-all duration-1000 ease-in-out ${
                    currentTip === index 
                      ? "opacity-100 translate-x-0 pointer-events-auto" 
                      : "opacity-0 translate-x-8 pointer-events-none"
                  }`}
                >
                  {/* Image Header */}
                  <div className="h-56 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-primary/20 mix-blend-overlay group-hover:bg-transparent transition-colors duration-700 z-10" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 to-transparent z-20" />
                    <img 
                      src={tip.image} 
                      alt={tip.title}
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                    />
                    <div className="absolute top-6 left-6 z-30 bg-black/40 backdrop-blur-md border border-white/20 px-4 py-1.5 rounded-full flex items-center gap-2 shadow-lg">
                      <ShieldCheck className="text-primary w-4 h-4" />
                      <span className="text-[10px] font-black text-white uppercase tracking-widest">Consejo TI</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="px-8 pt-2 pb-8 flex-1 flex flex-col">
                    <h1 className="text-2xl font-black text-white tracking-tight mb-3">
                      {tip.title}
                    </h1>
                    <p className="text-slate-400 text-sm leading-relaxed font-medium">
                      {tip.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Footer with indicators */}
            <div className="p-6 bg-black/20 border-t border-white/5 flex items-center justify-between relative z-30">
              <div className="text-[11px] font-black text-slate-500 uppercase tracking-widest">
                Tip {currentTip + 1} de {tips.length}
              </div>
              <div className="flex gap-2">
                {tips.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentTip(index)}
                    className={`h-1.5 rounded-full transition-all duration-500 ${
                      currentTip === index ? "w-8 bg-primary" : "w-2 bg-white/20 hover:bg-white/40"
                    }`}
                    aria-label={`Ir al consejo ${index + 1}`}
                  />
                ))}
              </div>
            </div>

          </div>
        </div>

        <div className="relative z-10 flex items-center gap-4 text-slate-500 text-sm font-medium">
          <Building2 size={16} />
          <span>Uso Exclusivo Corporativo</span>
        </div>
      </div>

      {/* Lado Derecho - Formulario Corporativo Limpio */}
      <div className="w-full md:w-1/2 bg-background flex flex-col justify-center items-center p-6 sm:p-12 relative">
        
        {/* Botón de Modo Claro/Oscuro en la esquina superior derecha */}
        <div className="absolute top-6 right-6">
          <ThemeToggle />
        </div>

        <div className="w-full max-w-sm space-y-8">
          
          <div className="text-center md:text-left space-y-2">
            <div className="md:hidden w-10 h-10 bg-primary mx-auto rounded-lg flex items-center justify-center border border-primary/50 shadow-sm mb-6">
              <Command className="text-primary-foreground" size={20} />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Iniciar Sesión
            </h2>
            <p className="text-muted-foreground text-sm">
              Ingresa tus credenciales corporativas para acceder.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            
            {/* Campo Correo */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-xs font-semibold text-foreground uppercase tracking-wide">
                Correo Institucional
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                </div>
                <input
                  type="email"
                  id="email"
                  {...register("email")}
                  className="w-full pl-10 pr-4 py-2.5 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-colors text-foreground placeholder:text-muted-foreground/50 sm:text-sm"
                  placeholder="usuario@empresa.com"
                />
              </div>
              {errors.email && (
                <p className="text-red-400 text-xs font-medium">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Campo Contraseña */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-xs font-semibold text-foreground uppercase tracking-wide">
                  Contraseña
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                </div>
                <input
                  type="password"
                  id="password"
                  {...register("password")}
                  className="w-full pl-10 pr-4 py-2.5 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-colors text-foreground placeholder:text-muted-foreground/50 sm:text-sm"
                  placeholder="••••••••"
                />
              </div>
              {errors.password && (
                <p className="text-red-400 text-xs font-medium">
                  {errors.password.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-primary-foreground bg-primary hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Autenticando...
                </span>
              ) : (
                "Acceder al Portal"
              )}
            </button>
          </form>
        </div>
        
      </div>
    </main>
  );
}
