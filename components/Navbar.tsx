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
    <nav className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md shadow-sm transition-all">
      <div className="max-w-6xl mx-auto px-6 h-16 flex justify-between items-center">
        
        {/* Logo / Título */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-sm">IT</span>
            </div>
            <span className="font-bold text-xl text-gray-900 tracking-tight">
              Help<span className="text-blue-600">Desk</span>
            </span>
          </Link>
        </div>

        {/* Zona de Usuario / Acciones */}
        <div className="flex items-center gap-4">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="focus:outline-none">
                <div className="flex items-center gap-3 p-1.5 rounded-full hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-all cursor-pointer">
                  {/* Etiqueta visible en escritorio */}
                  <span className="hidden sm:inline-flex items-center gap-2 text-xs text-gray-600 bg-gray-100 px-3 py-1.5 rounded-md font-medium">
                    {user.email} 
                    <span className="text-blue-700 font-black bg-blue-100 px-2 py-0.5 rounded uppercase tracking-[0.1em] text-[9px]">
                      {role}
                    </span>
                  </span>
                  
                  {/* Avatar */}
                  <Avatar className="h-9 w-9 shadow-sm border border-gray-200">
                    <AvatarFallback className="bg-blue-600 text-white font-bold text-sm">
                      {user.email?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </DropdownMenuTrigger>
              
              <DropdownMenuContent align="end" className="w-56 mt-2">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1.5 text-sm p-1">
                    <p className="font-medium leading-none text-gray-900 truncate">
                      {user.email}
                    </p>
                    <p className="text-[10px] leading-none text-gray-500 uppercase font-bold tracking-wider">
                      Perfil: <span className="text-blue-600">{role}</span>
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={logout}
                  className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer font-semibold py-2"
                >
                  Cerrar Sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
             <Link 
               href="/login" 
               className="text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 px-5 py-2.5 rounded-lg transition-colors shadow-sm"
             >
               Iniciar Sesión
             </Link>
          )}
        </div>
      </div>
    </nav>
  );
}