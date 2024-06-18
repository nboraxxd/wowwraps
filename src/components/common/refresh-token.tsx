'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

import { checkAndRefreshToken } from '@/utils'
import { useAuthStore } from '@/lib/stores/auth-store'

// không check refresh token cho các path này
const UNAUTHENTICATED_PATHS = ['/login', '/logout', '/refresh-token']

export default function RefreshToken() {
  const setIsAuth = useAuthStore((state) => state.setIsAuth)

  const pathname = usePathname()

  useEffect(() => {
    if (UNAUTHENTICATED_PATHS.includes(pathname)) return

    let interval: NodeJS.Timeout | null = null

    // Phải gọi 1 lần đầu tiên vì interval sẽ chỉ chạy sau thời gian TIMEOUT
    checkAndRefreshToken({
      onSuccess: () => {
        console.log('🚀 first checkAndRefreshToken')
        setIsAuth(true)
      },
      onError: () => {
        if (interval) clearInterval(interval)
      },
    })

    // Timeout interval phải nhỏ hơn thời gian hết hạn của access token
    // Ví dụ access token hết hạn sau 30s thì 10s chúng ta sẽ check refresh token 1 lần
    const TIMEOUT = 1000
    interval = setInterval(
      () =>
        checkAndRefreshToken({
          onSuccess: () => {
            console.log('🚀 other checkAndRefreshToken')
          },
          onError: () => {
            if (interval) clearInterval(interval)
          },
        }),
      TIMEOUT
    )

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [pathname, setIsAuth])

  return null
}
