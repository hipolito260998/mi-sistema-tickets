import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Obtener credenciales de admin desde variables de entorno
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
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

    // Crear cliente de usuario para verificar permisos
    const userClient = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "", {
      global: {
        headers: {
          Authorization: authHeader,
        },
      },
    });

    // Verificar que el usuario actual sea admin
    const { data: currentUser } = await userClient
      .from("profiles")
      .select("role")
      .eq("id", (await userClient.auth.getUser()).data.user?.id || "");

    if (!currentUser || currentUser[0]?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Solo administradores pueden eliminar usuarios" },
        { status: 403 }
      );
    }

    // Eliminar usuario de auth.users
    const { error: authError } = await adminClient.auth.admin.deleteUser(userId);

    if (authError && !authError.message.includes("not found")) {
      throw authError;
    }

    // Eliminar de la tabla profiles
    const { error: profileError } = await adminClient
      .from("profiles")
      .delete()
      .eq("id", userId);

    if (profileError) throw profileError;

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
