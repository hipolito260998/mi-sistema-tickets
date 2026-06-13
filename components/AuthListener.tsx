"use client";

import { useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

export function AuthListener() {
  const supabase = createClient();

  useEffect(() => {
    // 1. Verificar si la URL trae un código PKCE (nuevo estándar de Supabase)
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get("code");
      if (code) {
        window.location.href = `/auth/callback${window.location.search}&type=recovery`;
        return;
      }

      // 1.5 Verificar el Hash Fragment (Flujo antiguo) manualmente por si onAuthStateChange es lento
      const hash = window.location.hash;
      if (hash.includes("type=recovery")) {
        // Redirigir PERO conservando el hash para que Supabase pueda iniciar sesión en la nueva página
        window.location.href = "/update-password" + hash;
        return;
      }
    }

    // 2. Escuchar el evento de recuperación (flujo Legacy / Hash)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        window.location.href = "/update-password";
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  return null;
}
