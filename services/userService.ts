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
