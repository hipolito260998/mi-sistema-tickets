"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { User } from "@supabase/supabase-js";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";

interface NavbarProps {
  user?: User | null;
  role?: string | null;
}

export default function Navbar({ user: serverUser, role: serverRole }: NavbarProps) {
  const pathname = usePathname();
  const { logout } = useAuth();
  
  // Usar datos del servidor si están disponibles
  const user = serverUser;
  const role = serverRole;

  // Ocultamos el Navbar en el login
  if (pathname === "/login") return null;

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-black/10 dark:border-white/5 bg-background/60 backdrop-blur-xl shadow-2xl transition-all">
      <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
        
        {/* Logo / Título */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-sm border border-primary/50">
              <span className="text-primary-foreground font-black text-sm tracking-tighter">IT</span>
            </div>
            <span className="font-black text-xl text-foreground tracking-tight flex items-center">
              Help<span className="text-primary ml-0.5">Desk</span>
            </span>
          </Link>
        </div>

        {/* Zona de Usuario / Acciones */}
        <div className="flex items-center gap-4">
          <ThemeToggle />

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="focus:outline-none">
                <div className="flex items-center gap-3 p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/5 border border-transparent hover:border-black/10 dark:hover:border-white/10 transition-all cursor-pointer">
                  {/* Etiqueta visible en escritorio */}
                  <span className="hidden sm:inline-flex items-center gap-2 text-xs text-muted-foreground bg-accent border border-border px-3 py-1.5 rounded-full font-medium shadow-inner">
                    {user.email} 
                    <span className="text-primary font-black bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full uppercase tracking-[0.1em] text-[9px]">
                      {role}
                    </span>
                  </span>
                  
                  {/* Avatar */}
                  <Avatar className="h-9 w-9 shadow-md border border-black/10 dark:border-white/10 ring-2 ring-transparent hover:ring-primary/50 transition-all">
                    <AvatarFallback className="bg-primary/20 text-primary font-black text-sm backdrop-blur-sm">
                      {user.email?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </DropdownMenuTrigger>
              
              <DropdownMenuContent align="end" className="w-56 mt-2 border-black/10 dark:border-white/10 bg-card dark:bg-background/95 backdrop-blur-xl shadow-2xl rounded-xl">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1.5 text-sm p-1">
                    <p className="font-medium leading-none text-foreground truncate">
                      {user.email}
                    </p>
                    <p className="text-[10px] leading-none text-muted-foreground uppercase font-bold tracking-wider mt-2">
                      Perfil: <span className="text-primary">{role}</span>
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-black/10 dark:bg-white/10" />
                <DropdownMenuItem 
                  onClick={logout}
                  className="text-rose-600 dark:text-rose-400 focus:text-rose-700 dark:focus:text-rose-300 focus:bg-rose-100 dark:focus:bg-rose-950/30 cursor-pointer font-semibold py-2 rounded-lg transition-colors"
                >
                  Cerrar Sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
             <Link 
               href="/login" 
               className="text-sm font-bold text-primary-foreground bg-primary hover:bg-primary/90 px-6 py-2.5 rounded-full transition-all border border-primary/50"
             >
               Iniciar Sesión
             </Link>
          )}
        </div>
      </div>
    </nav>
  );
}