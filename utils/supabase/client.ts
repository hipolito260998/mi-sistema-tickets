// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // Inicializa Supabase usando las variables de entorno de tu .env.local
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: true, // Mantiene la sesión del usuario
        autoRefreshToken: true, // Refresca el token automáticamente
      }
    }
  )
}