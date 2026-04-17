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

    const userId = data.user?.id;
    if (!userId) throw new Error("Usuario no autenticado correctamente");

    // Obtener el rol de la tabla 'profiles'
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    // Si el perfil no existe, crear uno automáticamente como CUSTOMER
    if (profileError?.code === 'PGRST116') { // No rows found
      const { error: insertError } = await supabase
        .from('profiles')
        .insert([{ id: userId, role: 'CUSTOMER' }]);
      
      if (insertError) throw new Error(`Error creando perfil: ${insertError.message}`);
      return { user: data.user, role: 'CUSTOMER' };
    }

    if (profileError) throw profileError;

    return { user: data.user, role: profile?.role || 'CUSTOMER' };
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