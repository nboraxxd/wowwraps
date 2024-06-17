'use client'

import jwt from 'jsonwebtoken'
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

import { TokenPayload } from '@/types/jwt.types'
import { useRefreshTokenToServerMutation } from '@/lib/tanstack-query/use-auth'
import {
  getAccessTokenFromLocalStorage,
  getRefreshTokenFromLocalStorage,
  setAccessTokenToLocalStorage,
  setRefreshTokenToLocalStorage,
} from '@/utils/local-storage'

// không check refresh token cho các path này
const UNAUTHENTICATED_PATHS = ['/login', '/logout', '/refresh-token']

export default function RefreshToken() {
  const pathname = usePathname()

  const { mutateAsync: refreshTokenMutateAsync } = useRefreshTokenToServerMutation()

  useEffect(() => {
    if (UNAUTHENTICATED_PATHS.includes(pathname)) return

    let interval: NodeJS.Timeout | null = null

    async function checkAndRefreshToken() {
      // Không nên đưa logic lấy access token và refresh token ra khỏi function `checkAndRefreshToken`
      // Vì để mỗi lần mà gọi function `checkAndRefreshToken` thì sẽ lấy access token và refresh token mới
      // Để tránh hiện tượng bug nó lấy access token và refresh token cũ ở lần đầu rồi gọi cho các lần tiếp theo
      const accessToken = getAccessTokenFromLocalStorage()
      const refreshToken = getRefreshTokenFromLocalStorage()

      // Chưa đăng nhập thì không cần check refresh token
      if (!accessToken || !refreshToken) return

      const accessTokenDecoded = jwt.decode(accessToken) as TokenPayload
      const refreshTokenDecoded = jwt.decode(refreshToken) as TokenPayload

      // Thời điểm hết hạn của token được tính theo epoch time giây
      // Còn khi dùng cú pháp `new Date().getTime()` thì nó sẽ trả về epoch time theo mili giây
      const now = Math.floor(new Date().getTime() / 1000)

      // Trường hợp refresh token hết hạn thì không xử lý nữa
      if (refreshTokenDecoded.exp <= now) return

      // Ví dụ access token có thời gian hết hạn là 30s
      // thì chúng ta sẽ refresh token khi access token còn 1/3 thời gian
      // Thời gian còn lại của access token sẽ tính theo công thức: accessTokenDecoded.exp - now
      // Thời gian hết hạn của access token sẽ tính theo công thức: accessTokenDecoded.exp - accessTokenDecoded.iat

      // Thời gian còn lại của access token nhỏ hơn 1/3 thời gian hết hạn của access token
      if (accessTokenDecoded.exp - now < (accessTokenDecoded.exp - accessTokenDecoded.iat) / 3) {
        try {
          const response = await refreshTokenMutateAsync()

          setAccessTokenToLocalStorage(response.payload.data.accessToken)
          setRefreshTokenToLocalStorage(response.payload.data.refreshToken)
        } catch (error) {
          if (interval) clearInterval(interval)
        }
      }
    }

    // Phải gọi 1 lần đầu tiên vì interval sẽ chỉ chạy sau thời gian TIMEOUT
    checkAndRefreshToken()

    // Timeout interval phải nhỏ hơn thời gian hết hạn của access token
    // Ví dụ access token hết hạn sau 30s thì 10s chúng ta sẽ check refresh token 1 lần
    const TIMEOUT = 2000
    interval = setInterval(checkAndRefreshToken, TIMEOUT)

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [pathname, refreshTokenMutateAsync])

  return null
}
