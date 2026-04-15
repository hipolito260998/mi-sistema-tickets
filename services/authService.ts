import { SupabaseClient } from '@supabase/supabase-js';

export const authService = {
  // 1. Registro con Email y Contraseña
  async signUp(supabase: SupabaseClient, email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  // 2. Inicio de sesión con Email y Contraseña
  async signIn(supabase: SupabaseClient, email: string, password: string) {
    // Primero autenticamos las credenciales
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;

    // Si la contraseña es correcta, obtenemos el rol de la tabla 'profiles'
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user?.id)
      .single();

    return { user: data.user, role: profile?.role };
  },

  // 3. Cerrar sesión
  async signOut(supabase: SupabaseClient) {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // 4. Utilidad para verificar sesión actual (Útil para el Navbar o Guards)
  async getCurrentSession(supabase: SupabaseClient) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    return { user, role: profile?.role };
  }
};