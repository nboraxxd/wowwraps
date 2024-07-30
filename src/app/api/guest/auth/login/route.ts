import { cookies } from 'next/headers'

import { HttpError } from '@/utils/http'
import { decodeToken } from '@/utils'
import guestApi from '@/api-requests/guest.api'
import { GuestLoginBodyType } from '@/lib/schema/guest.schema'

export async function POST(request: Request) {
  const body = (await request.json()) as GuestLoginBodyType

  const cookieStore = cookies()

  try {
    const { payload } = await guestApi.loginFromServerToBackend(body)

    const {
      data: { accessToken, refreshToken },
    } = payload

    const accessTokenDecoded = decodeToken(accessToken)
    const refreshTokenDecoded = decodeToken(refreshToken)

    cookieStore.set('accessToken', accessToken, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: true,
      expires: accessTokenDecoded.exp * 1000,
    })

    cookieStore.set('refreshToken', refreshToken, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: true,
      expires: refreshTokenDecoded.exp * 1000,
    })

    return Response.json(payload)
  } catch (error: any) {
    console.log('🔥 ~ POST ~ error:', error)
    if (error instanceof HttpError) {
      return Response.json(error.payload, { status: error.status })
    } else {
      return Response.json({ message: error.message }, { status: 500 })
    }
  }
}
