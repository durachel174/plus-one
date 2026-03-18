import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export async function middleware(request) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Routes that require login only
  const authRoutes = ['/membership']
  // Routes that require approved membership
  const memberRoutes = ['/host', '/dinners']

  const needsAuth = authRoutes.some(r => request.nextUrl.pathname.startsWith(r))
  const needsMember = memberRoutes.some(r => request.nextUrl.pathname.startsWith(r))

  if ((needsAuth || needsMember) && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (needsMember && user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('membership_status')
      .eq('id', user.id)
      .single()

    if (profile?.membership_status !== 'approved') {
      return NextResponse.redirect(new URL('/pending', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/membership', '/host', '/dinners/:path*'],
}