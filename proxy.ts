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
    const { data: { user } } = await supabase.auth.getUser()

    // --- CASO A: USUARIO NO AUTENTICADO ---
    if (!user) {
        if (request.nextUrl.pathname !== '/login') {
            return NextResponse.redirect(new URL('/login', request.url))
        }
        return response;
    }

    // --- CASO B: USUARIO AUTENTICADO ---
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    const role = profile?.role;

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
