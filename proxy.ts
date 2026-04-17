import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // SOLO PROTEGER /login - evitar loops infinitos en móvil
    // Las rutas /, /dashboard son manejadas por el layout/page
    if (request.nextUrl.pathname === '/login') {
        let user = null;
        try {
            const { data: { user: authUser } } = await supabase.auth.getUser()
            user = authUser;
        } catch (error) {
            console.error('Error verificando autenticación en /login:', error);
        }

        // Si está autenticado y trata de entrar a /login, redirigir
        if (user) {
            // Obtener el rol del usuario
            let role = 'CUSTOMER';
            try {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', user.id)
                    .single();
                if (profile?.role) {
                    role = profile.role;
                }
            } catch (error) {
                console.error('Error obteniendo perfil:', error);
            }

            // Redirigir al home o dashboard según el rol
            return NextResponse.redirect(new URL(role === 'ADMIN' ? '/dashboard' : '/', request.url))
        }
    }

    // PERMITIR TODAS LAS OTRAS RUTAS - el cliente manejará la protección
    return response
}

// Configuración de rutas protegidas
export const config = {
    matcher: ['/', '/dashboard/:path*', '/login'],
}
