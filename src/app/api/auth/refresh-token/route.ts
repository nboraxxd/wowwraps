import { cookies } from 'next/headers'

import authApi from '@/api-requests/auth.api'
import { decodeToken } from '@/utils'

export async function POST() {
  const cookieStore = cookies()

  const refreshToken = cookieStore.get('refreshToken')?.value

  if (!refreshToken) {
    return Response.json({ message: 'Refresh token not found' }, { status: 401 })
  }

  try {
    const { payload } = await authApi.refreshTokenFromServerToBackend({ refreshToken })

    const {
      data: { accessToken: newAccessToken, refreshToken: newRefreshToken },
    } = payload

    const newAccessTokenDecoded = decodeToken(newAccessToken)
    const newRefreshTokenDecoded = decodeToken(newRefreshToken)

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
    return Response.json({ message: error.message || 'Something went wrong' }, { status: 401 })
  }
}
