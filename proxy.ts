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

    // 1. Obtener el usuario autenticado
    let user = null;
    try {
        const { data: { user: authUser } } = await supabase.auth.getUser()
        user = authUser;
    } catch (error) {
        // Si hay error al obtener el usuario, no lo rechazamos automáticamente
        // Podría ser un error temporal de conexión
        console.error('Error verificando autenticación:', error);
    }

    // --- CASO A: USUARIO NO AUTENTICADO ---
    if (!user) {
        if (request.nextUrl.pathname !== '/login') {
            return NextResponse.redirect(new URL('/login', request.url))
        }
        return response;
    }

    // --- CASO B: USUARIO AUTENTICADO ---
    let role = null;
    try {
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();
        role = profile?.role;
    } catch (error) {
        // Si hay error buscando el perfil, usar CUSTOMER como default
        // Esto evita loops infinitos por errores temporales de BD
        console.error('Error obteniendo perfil:', error);
        role = 'CUSTOMER';
    }

    // 1. Redirección si intenta ir al login ya autenticado
    if (request.nextUrl.pathname === '/login') {
        return NextResponse.redirect(new URL(role === 'ADMIN' ? '/dashboard' : '/', request.url))
    }

    // 2. Bloqueo de Dashboard para Clientes
    if (role === 'CUSTOMER' && request.nextUrl.pathname.startsWith('/dashboard')) {
        return NextResponse.redirect(new URL('/', request.url))
    }

    // 3. Redirección de Admin al Dashboard si intenta entrar al home
    if (role === 'ADMIN' && request.nextUrl.pathname === '/') {
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    return response
}

// Configuración de rutas protegidas
export const config = {
    matcher: ['/', '/dashboard/:path*', '/login'],
}
