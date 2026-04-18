import { SupabaseClient } from '@supabase/supabase-js';

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
      // 1. Crear el usuario en Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
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

      // 2. Crear el perfil en la tabla profiles
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .insert([{
          id: authData.user.id,
          email,
          first_name,
          last_name,
          role,
          area
        }])
        .select()
        .single();

      if (profileError) {
        console.error("Error creando perfil:", profileError);
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
