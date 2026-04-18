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

    // Proteger /login - redirigir usuarios autenticados away
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

    // Proteger / y /dashboard - redirigir no autenticados a /login
    // Proteger / y /dashboard - redirigir no autenticados a /login
    if (request.nextUrl.pathname === '/' || request.nextUrl.pathname === '/dashboard') {
        let user = null;
        try {
            const { data: { user: authUser } } = await supabase.auth.getUser()
            user = authUser;
        } catch (error) {
            console.error('Error verificando autenticación:', error);
        }

        // Si NO está autenticado, redirigir a login
        if (!user) {
            return NextResponse.redirect(new URL('/login', request.url))
        }

        // Obtener el rol del usuario (Lo necesitamos para ambas rutas)
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
            console.error('Error obteniendo perfil en middleware:', error);
        }

        // Regla 1: Si es ADMIN y trata de entrar a la vista de clientes (/), mándalo a su dashboard
        if (request.nextUrl.pathname === '/' && role === 'ADMIN') {
            return NextResponse.redirect(new URL('/dashboard', request.url))
        }

        // Regla 2: Si NO es ADMIN (ej. CUSTOMER o LEAD) y trata de entrar al dashboard, regrésalo a su portal (/)
        if (request.nextUrl.pathname === '/dashboard' && role !== 'ADMIN') {
            return NextResponse.redirect(new URL('/', request.url))
        }
    }

    return response
}

// Configuración de rutas protegidas
// Protegemos /login (solo autenticados), / y /dashboard (solo no-autenticados)
export const config = {
    matcher: ['/', '/login', '/dashboard'],
}
