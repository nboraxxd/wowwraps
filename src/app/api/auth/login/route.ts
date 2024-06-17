import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

import authApi from '@/api-requests/auth.api'
import { TokenPayload } from '@/types/jwt.types'
import { HttpError } from '@/utils/http'
import { LoginBodyType } from '@/lib/schemaValidations/auth.schema'

export async function POST(request: Request) {
  const body = (await request.json()) as LoginBodyType

  const cookieStore = cookies()

  try {
    const { payload } = await authApi.loginFromBrowserToBackend(body)

    const {
      data: { accessToken, refreshToken },
    } = payload

    const accessTokenDecoded = jwt.decode(accessToken) as TokenPayload
    const refreshTokenDecoded = jwt.decode(refreshToken) as TokenPayload

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
  } catch (error) {
    if (error instanceof HttpError) {
      return Response.json(error.payload, { status: error.status })
    } else {
      return Response.json({ message: 'Internal Server Error' }, { status: 500 })
    }
  }
}
