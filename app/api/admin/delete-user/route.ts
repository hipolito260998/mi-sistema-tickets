import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Obtener credenciales de admin desde variables de entorno
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseServiceKey || !supabaseAnonKey) {
      return NextResponse.json(
        { error: "Credenciales de servidor no configuradas" },
        { status: 500 }
      );
    }

    // Crear cliente de admin
    const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Obtener datos del cliente
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "userId es requerido" },
        { status: 400 }
      );
    }

    // Verificar que el usuario actual sea admin
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    // Obtener el token y extraer el user ID
    const token = authHeader.replace("Bearer ", "");

    // Usar cliente de usuario para obtener info del usuario actual
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: authHeader,
        },
      },
    });

    // Obtener usuario actual
    const { data: { user: currentAuthUser }, error: authError } = await userClient.auth.getUser();

    if (authError || !currentAuthUser) {
      console.error("Auth error:", authError);
      return NextResponse.json(
        { error: "Usuario no autenticado" },
        { status: 401 }
      );
    }

    // Obtener rol del usuario actual desde profiles
    const { data: currentUserProfile, error: profileFetchError } = await adminClient
      .from("profiles")
      .select("role")
      .eq("id", currentAuthUser.id)
      .single();

    if (profileFetchError) {
      console.error("Error al obtener perfil:", profileFetchError);
      return NextResponse.json(
        { error: "Error al verificar permisos" },
        { status: 500 }
      );
    }

    if (!currentUserProfile || currentUserProfile.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Solo administradores pueden eliminar usuarios" },
        { status: 403 }
      );
    }

    // Eliminar usuario de auth.users
    const { error: authDeleteError } = await adminClient.auth.admin.deleteUser(userId);

    if (authDeleteError && !authDeleteError.message?.includes("not found")) {
      console.error("Error al eliminar de auth:", authDeleteError);
      throw authDeleteError;
    }

    // Eliminar de la tabla profiles
    const { error: profileDeleteError } = await adminClient
      .from("profiles")
      .delete()
      .eq("id", userId);

    if (profileDeleteError) {
      console.error("Error al eliminar perfil:", profileDeleteError);
      throw profileDeleteError;
    }

    return NextResponse.json(
      { success: true, message: "Usuario eliminado correctamente" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error en delete-user:", error);
    return NextResponse.json(
      { error: error.message || "Error al eliminar usuario" },
      { status: 500 }
    );
  }
}
