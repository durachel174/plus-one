import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export async function middleware(request) {
  let response = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )

          response = NextResponse.next({
            request,
          })

          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  const authRoutes = ['/membership']
  const memberRoutes = ['/host', '/dinners']

  const needsAuth = authRoutes.some((route) => pathname.startsWith(route))
  const needsMember = memberRoutes.some((route) => pathname.startsWith(route))

  if ((needsAuth || needsMember) && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (needsMember && user) {
    const { data: profile } = await supabase
        .from('profiles')
        .select('id, membership_status')
        .eq('id', user.id)
        .maybeSingle()

    const status = profile?.membership_status

    if (status === 'approved') {
        // let them through
    } else if (status === 'pending') {
        return NextResponse.redirect(new URL('/pending', request.url))
    } else {
        // null or anything else — they haven't applied yet
        return NextResponse.redirect(new URL('/membership', request.url))
    }
    }

  return response
}

export const config = {
  matcher: ['/membership', '/host', '/dinners/:path*', '/host/dinners/:path*'],
}