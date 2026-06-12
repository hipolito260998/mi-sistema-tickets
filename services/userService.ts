import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: 'ADMIN' | 'CUSTOMER' | 'AREA_LEAD';
  area: string;
}

export const userService = {
  async getAllUsers(supabase: SupabaseClient): Promise<UserProfile[]> {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, email, first_name, last_name, role, area")
        .order("email", { ascending: true });

      if (error) {
        console.error("Error en getAllUsers:", error);
        return [];
      }
      return (data as UserProfile[]) || [];
    } catch (err) {
      console.error("Error crítico en getAllUsers:", err);
      return [];
    }
  },

  async createUser(supabase: SupabaseClient, email: string, password: string, first_name: string, last_name: string, role: 'ADMIN' | 'CUSTOMER' | 'AREA_LEAD', area: string): Promise<UserProfile> {
    try {

        const tempSupabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          auth: {
            persistSession: false,
            autoRefreshToken: false,
            storageKey: 'temp-user-creation-key',
          }
        }
      );

      // 1. Crear el usuario en Auth (Esto dispara el Trigger en tu Base de Datos)
      const { data: authData, error: authError } = await tempSupabase.auth.signUp({
        email,
        password,
      });

      if (authError) {
        console.error("Error en auth.signUp:", authError);
        throw authError;
      }

      if (!authData.user?.id) {
        throw new Error("No se pudo obtener el ID del usuario creado");
      }

      // 2. ACTUALIZAR el perfil que el Trigger acaba de crear
      // Cambiamos el .insert() por .update() y agregamos el .eq()
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .update({
          first_name,
          last_name,
          role,
          area
        })
        .eq("id", authData.user.id)
        .select()
        .single();

      if (profileError) {
        console.error("Error actualizando perfil del nuevo usuario:", profileError);
        throw profileError;
      }

      return profile as UserProfile;
    } catch (err) {
      console.error("Error en createUser:", err);
      throw err;
    }
  },

  async updateUserRole(supabase: SupabaseClient, userId: string, role: 'ADMIN' | 'CUSTOMER' | 'AREA_LEAD'): Promise<void> {
    const { error } = await supabase
      .from("profiles")
      .update({ role })
      .eq("id", userId);

    if (error) {
      console.error("Error actualizando rol:", error);
      throw error;
    }
  },

  async updateUserArea(supabase: SupabaseClient, userId: string, area: string): Promise<void> {
    const { error } = await supabase
      .from("profiles")
      .update({ area })
      .eq("id", userId);

    if (error) {
      console.error("Error actualizando área:", error);
      throw error;
    }
  },

  async updateUserName(supabase: SupabaseClient, userId: string, first_name: string, last_name: string): Promise<void> {
    const { error } = await supabase
      .from("profiles")
      .update({ first_name, last_name })
      .eq("id", userId);

    if (error) {
      console.error("Error actualizando nombre:", error);
      throw error;
    }
  },

  async updateUserDetails(supabase: SupabaseClient, userId: string, updates: Partial<UserProfile>): Promise<void> {
    const { error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", userId);

    if (error) {
      console.error("Error actualizando usuario:", error);
      throw error;
    }
  }
};