import { cookies } from 'next/headers'

import authApi from '@/api-requests/auth.api'

export async function POST() {
  const cookieStore = cookies()

  const accessToken = cookieStore.get('accessToken')?.value
  const refreshToken = cookieStore.get('refreshToken')?.value

  cookieStore.delete('accessToken')
  cookieStore.delete('refreshToken')

  if (!accessToken || !refreshToken) {
    return Response.json({
      message: 'Không nhận được access token hoặc refresh token nhưng vẫn thực hiện đăng xuất thành công',
    })
  }

  try {
    const { payload } = await authApi.bLogout({ accessToken, refreshToken })

    return Response.json(payload)
  } catch (error) {
    return Response.json({
      message: 'Không thể gọi API logout đến server backend nhưng vẫn thực hiện đăng xuất thành công',
    })
  }
}
