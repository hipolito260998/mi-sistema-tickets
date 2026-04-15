"use client";

import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Navbar() {
  const supabase = createClient();
  const router = useRouter();
  const pathname = usePathname();
  
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);

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
      }
    }

    // 1. Carga inicial del usuario
    supabase.auth.getUser().then(({ data: { user: currentUser } }) => {
      if (isMounted && currentUser) {
        setUser(currentUser);
        getProfile(currentUser.id);
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
        }
      }
    });

    // 3. LIMPIEZA DE FUGA DE MEMORIA
    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    // No hace falta router.refresh() si onAuthStateChange ya limpia el estado
    router.push("/login");
  };

  if (pathname === "/login") return null;

  return (
    <nav className="bg-white border-b border-gray-200 py-3 px-6 shadow-sm">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="text-xl font-bold text-blue-600 flex items-center gap-2"
          >
            <span className="bg-blue-600 text-white p-1 rounded">IT</span>{" "}
            HelpDesk
          </Link>

          <div className="hidden md:flex gap-4 text-sm font-medium text-gray-600">
            {role === "ADMIN" && (
              <Link
                href="/dashboard"
                className={`hover:text-blue-600 font-medium transition-colors ${
                  pathname === "/dashboard" ? "text-blue-600" : "text-gray-600"
                }`}
              >
                Dashboard General
              </Link>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <span className="hidden sm:inline text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                {user.email} <span className="font-bold">({role})</span>
              </span>
              <button
                onClick={handleLogout}
                className="text-sm font-semibold text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg transition"
              >
                Cerrar Sesión
              </button>
            </>
          ) : (
             <Link href="/login" className="text-sm font-semibold text-blue-600">
               Iniciar Sesión
             </Link>
          )}
        </div>
      </div>
    </nav>
  );
}