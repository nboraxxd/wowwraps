import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

import guestApi from '@/api-requests/guest.api'
import { TokenPayload } from '@/types/jwt.types'

export async function POST() {
  const cookieStore = cookies()

  const refreshToken = cookieStore.get('refreshToken')?.value

  if (!refreshToken) {
    return Response.json({ message: 'Refresh token not found' }, { status: 401 })
  }

  try {
    const { payload } = await guestApi.refreshTokenFromServerToBackend({ refreshToken })

    const {
      data: { accessToken: newAccessToken, refreshToken: newRefreshToken },
    } = payload

    const newAccessTokenDecoded = jwt.decode(newAccessToken) as TokenPayload
    const newRefreshTokenDecoded = jwt.decode(newRefreshToken) as TokenPayload

    cookieStore.set('accessToken', newAccessToken, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: true,
      expires: newAccessTokenDecoded.exp * 1000,
    })

    cookieStore.set('refreshToken', newRefreshToken, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: true,
      expires: newRefreshTokenDecoded.exp * 1000,
    })

    return Response.json(payload)
  } catch (error: any) {
    console.log('🔥 ~ POST ~ error:', error)
    return Response.json({ message: error.message || 'Something went wrong' }, { status: 401 })
  }
}
