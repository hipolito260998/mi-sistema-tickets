"use client";

import { authService } from "@/services/authService";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Login() {
  const supabase = createClient();
  const router = useRouter();

  // Estados del Formulario
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [esRegistro, setEsRegistro] = useState(false);

  // Control de montaje para evitar errores de memoria
  const [isMounted, setIsMounted] = useState(true);

  useEffect(() => {
    return () => setIsMounted(false);
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMensaje("🔄 Procesando login...");

    try {
      if (esRegistro) {
        // Registro usando el servicio SOLID
        await authService.signUp(supabase, email, password);

        if (isMounted) {
          setMensaje("✅ Cuenta creada con éxito. Ahora inicia sesión.");
          setEsRegistro(false);
          setPassword("");
        }
      } else {
        // Login usando el servicio (ahora nos devuelve el rol directamente)
        const { role } = await authService.signIn(supabase, email, password);

        if (!isMounted) return;

        setMensaje("⏳ Guardando sesión (3.5 segundos)...");

        // EN VERCEL: Las cookies toman más tiempo en propagarse que en local
        // 3.5 segundos es crítico para asegurar que la cookie esté disponible en el servidor
        await new Promise(resolve => setTimeout(resolve, 3500));

        setMensaje("🔄 Cargando...");

        const destino = role === "ADMIN" ? "/dashboard" : "/";
        
        // window.location.href hace un FULL PAGE RELOAD que envía las cookies correctamente
        // Esto es más robusto que router.push() en Vercel con conexiones lentas
        console.log(`[Login] Redirecting to ${destino}`);
        window.location.href = destino;
      }
    } catch (err) {
      // TypeScript lo tratará como 'unknown' por defecto
      if (isMounted) {
        // Verificamos si 'err' es realmente un objeto Error para obtener el .message
        const errorMsg =
          err instanceof Error ? err.message : "Error inesperado";

        console.error("Login error:", errorMsg);

        setMensaje(
          `❌ ${errorMsg.includes("invalid") ? "Credenciales incorrectas" : errorMsg}`,
        );
        setLoading(false)
      }
    } 
  };

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-sm w-full text-gray-800 border border-gray-100">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-900">
          {esRegistro ? "Crear Cuenta" : "Iniciar Sesión"}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Correo electrónico
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition bg-white text-gray-900"
              placeholder="tu@correo.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Contraseña
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition bg-white text-gray-900"
              placeholder="Mínimo 6 caracteres"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 mt-4 shadow-sm active:scale-95"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Procesando...
              </span>
            ) : esRegistro ? (
              "Registrarse"
            ) : (
              "Entrar"
            )}
          </button>
        </form>

        {mensaje && (
          <div
            className={`mt-4 p-3 rounded-lg text-sm text-center font-medium animate-in fade-in zoom-in duration-300 ${
              mensaje.includes("✅")
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {mensaje}
          </div>
        )}

        <div className="mt-6 text-center text-sm border-t pt-4">
          <span className="text-gray-600">
            {esRegistro ? "¿Ya tienes cuenta?" : "¿No tienes cuenta?"}
          </span>
          <button
            type="button"
            onClick={() => {
              setEsRegistro(!esRegistro);
              setMensaje("");
              setPassword("");
            }}
            className="ml-2 text-blue-600 hover:text-blue-800 hover:underline font-semibold outline-none transition"
          >
            {esRegistro ? "Inicia sesión aquí" : "Regístrate aquí"}
          </button>
        </div>
      </div>
    </main>
  );
}
