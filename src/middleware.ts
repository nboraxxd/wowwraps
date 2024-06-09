import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const loggedInPaths = ['/manage']
const loggedOutPaths = ['/login']

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isAuth = Boolean(request.cookies.get('accessToken')?.value)

  if (loggedInPaths.some((item) => pathname.startsWith(item)) && !isAuth) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (loggedOutPaths.some((item) => pathname.startsWith(item)) && isAuth) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ['/login', '/manage/:path*'],
}
