import { cookies } from 'next/headers'

import guestApi from '@/api-requests/guest.api'

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
    const { payload } = await guestApi.logoutFromServerToBackend({ accessToken, refreshToken })

    return Response.json(payload)
  } catch (error) {
    console.log('🔥 ~ POST ~ error:', error)
    return Response.json({
      message: 'Không thể gọi API logout đến server backend nhưng vẫn thực hiện đăng xuất thành công',
    })
  }
}
