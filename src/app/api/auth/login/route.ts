import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'

import authApi from '@/api-requests/auth.api'
import { LoginBodyType } from '@/lib/schemaValidations/auth.schema'
import { TokenPayload } from '@/types/jwt.types'
import { HttpError } from '@/utils/http'

export async function POST(request: Request) {
  const body = (await request.json()) as LoginBodyType

  const cookieStore = cookies()

  try {
    const { payload } = await authApi.bLogin(body)

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
