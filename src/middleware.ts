import jwt from 'jsonwebtoken'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

import { TokenPayload } from '@/types/jwt.types'

const authorizedPaths = ['/guest']
const unauthenticatedPaths = ['/login', '/tables']

const adminPaths = ['/manage']

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const accessToken = request.cookies.get('accessToken')?.value
  const refreshToken = request.cookies.get('refreshToken')?.value

  // Redirect to login page if doesn't have refresh token and access token
  if (authorizedPaths.some((item) => pathname.startsWith(item)) && !refreshToken && !accessToken) {
    const url = new URL('/login', request.url)
    url.searchParams.set('next', pathname)

    return NextResponse.redirect(url)
  }

  // Redirect to home page if has refresh token
  if (unauthenticatedPaths.some((item) => pathname.startsWith(item)) && refreshToken) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Redirect to home page if not owner or employee
  if (adminPaths.some((item) => pathname.startsWith(item)) && refreshToken) {
    const refreshTokenDecoded = jwt.decode(refreshToken) as TokenPayload

    if (!['Owner', 'Employee'].includes(refreshTokenDecoded.role)) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  // Logged in but access token has expired
  if (authorizedPaths.some((item) => pathname.startsWith(item)) && refreshToken && !accessToken) {
    const url = new URL('/refresh-token', request.url)
    url.searchParams.set('refresh-token', refreshToken)
    url.searchParams.set('next', pathname)

    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ['/login', '/manage/:path*', '/tables/:path*'],
}
