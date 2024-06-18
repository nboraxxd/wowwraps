'use client'

import { toast } from 'sonner'
import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'

import { checkAndRefreshToken } from '@/utils'
import { useAuthStore } from '@/lib/stores/auth-store'

// không check refresh token cho các path này
const UNAUTHENTICATED_PATHS = ['/login', '/logout', '/refresh-token']

export default function RefreshToken() {
  const setIsAuth = useAuthStore((state) => state.setIsAuth)
  const setMe = useAuthStore((state) => state.setMe)

  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    if (UNAUTHENTICATED_PATHS.includes(pathname)) return

    let interval: NodeJS.Timeout | null = null

    const onError = () => {
      if (interval) {
        clearInterval(interval)
      }

      setIsAuth(false)
      setMe(null)

      const next = new URLSearchParams()
      next.set('next', pathname)

      router.push(`/login/?${next}`)
      router.refresh()
      toast.warning('Phiên đăng nhập của bạn đã hết hạn, vui lòng đăng nhập lại.')
    }

    // Phải gọi 1 lần đầu tiên vì interval sẽ chỉ chạy sau thời gian TIMEOUT
    checkAndRefreshToken({
      onSuccess: () => {
        console.log('🚀 first checkAndRefreshToken')
        setIsAuth(true)
      },
      onError,
    })

    // Timeout interval phải nhỏ hơn thời gian hết hạn của access token
    // Ví dụ access token hết hạn sau 30s thì 10s chúng ta sẽ check refresh token 1 lần
    const TIMEOUT = 10000
    interval = setInterval(
      () =>
        checkAndRefreshToken({
          onSuccess: () => {
            console.log('🚀 other checkAndRefreshToken')
          },
          onError,
        }),
      TIMEOUT
    )

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [pathname, router, setIsAuth, setMe])

  return null
}
