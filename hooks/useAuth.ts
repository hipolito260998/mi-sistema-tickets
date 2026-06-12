"use client";

import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

export function useAuth() {
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    // Función para obtener el perfil (Rol)
    async function getProfile(userId: string) {
      const { data } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .single();
      
      if (isMounted) {
        setRole(data?.role || "CUSTOMER");
        setLoading(false); // Terminó de cargar el rol
      }
    }

    // 1. Carga inicial del usuario
    supabase.auth.getUser().then(({ data: { user: currentUser } }) => {
      if (isMounted) {
        if (currentUser) {
          setUser(currentUser);
          getProfile(currentUser.id);
        } else {
          setLoading(false); // No hay usuario, dejó de cargar
        }
      }
    });

    // 2. ESCUCHAR CAMBIOS DE AUTH (Login/Logout en tiempo real)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (isMounted) {
        const newUser = session?.user ?? null;
        setUser(newUser);
        if (newUser) {
          getProfile(newUser.id);
        } else {
          setRole(null);
          setLoading(false);
        }
      }
    });

    // 3. LIMPIEZA DE FUGA DE MEMORIA
    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const logout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return { user, role, loading, logout };
}