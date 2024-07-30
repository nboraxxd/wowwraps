import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

import { decodeToken } from '@/utils'

const managePaths = ['/manage']
const guestPaths = ['/guest']
const privatePaths = [...managePaths, ...guestPaths]
const unauthenticatedPaths = ['/login', '/tables']

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const accessToken = request.cookies.get('accessToken')?.value
  const refreshToken = request.cookies.get('refreshToken')?.value

  // 1. Redirect to the login page if attempting to access private paths without a refresh token and access token
  if (privatePaths.some((item) => pathname.startsWith(item)) && !refreshToken && !accessToken) {
    const url = new URL('/login', request.url)
    url.searchParams.set('next', pathname)

    return NextResponse.redirect(url)
  }

  // 2. Case when there is a refresh token (user is logged in)
  if (refreshToken) {
    // 2.1. Redirect to home page if trying to access unauthenticated paths
    if (unauthenticatedPaths.some((item) => pathname.startsWith(item))) {
      return NextResponse.redirect(new URL('/', request.url))
    }

    // 2.2. Redirect to home page if trying to access manage or guest paths with the wrong role
    const { role } = decodeToken(refreshToken)
    if (
      (role === 'Guest' && managePaths.some((item) => pathname.startsWith(item))) ||
      (role !== 'Guest' && guestPaths.some((item) => pathname.startsWith(item)))
    ) {
      return NextResponse.redirect(new URL('/', request.url))
    }

    // 2.3. Redirect to refresh token page if access token has expired
    if (privatePaths.some((item) => pathname.startsWith(item)) && !accessToken) {
      const url = new URL('/refresh-token', request.url)
      url.searchParams.set('refresh-token', refreshToken)
      url.searchParams.set('next', pathname)

      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ['/login', '/manage/:path*', '/tables/:path*', '/guest/:path*'],
}
