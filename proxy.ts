import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// Cambiamos el nombre de la función exportada a "proxy"
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
                // Usamos los métodos modernos recomendados por Supabase y Next.js
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

    // 1. Obtenemos el usuario
    const { data: { user } } = await supabase.auth.getUser()

    // --- CASO A: USUARIO NO LOGUEADO ---
    if (!user) {
        if (request.nextUrl.pathname !== '/login') {
            return NextResponse.redirect(new URL('/login', request.url))
        }
        return response;
    }

    // --- CASO B: USUARIO LOGUEADO ---
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    const role = profile?.role;

    // 1. Redirección si intenta ir al login ya logueado
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

// Configuración de rutas
export const config = {
    matcher: ['/', '/dashboard/:path*', '/login'],
}