'use client'

import ms from 'ms'
import { toast } from 'sonner'
import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'

import { checkAndRefreshToken } from '@/utils'
import { useAuthStore } from '@/lib/stores/auth-store'
import envConfig from '@/constants/config'

// không check refresh token cho các path này
const UNAUTHENTICATED_PATHS = ['/login', '/logout', '/refresh-token']

export default function RefreshToken() {
  const role = useAuthStore((state) => state.role)
  const setRole = useAuthStore((state) => state.setRole)

  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    if (UNAUTHENTICATED_PATHS.includes(pathname)) return

    let interval: NodeJS.Timeout | null = null

    const onError = () => {
      if (interval) {
        clearInterval(interval)
      }

      setRole(undefined)

      const next = new URLSearchParams()
      next.set('next', pathname)

      router.push(`/login/?${next}`)
      router.refresh()
      toast.warning('Phiên đăng nhập của bạn đã hết hạn, vui lòng đăng nhập lại.')
    }

    // Phải gọi 1 lần đầu tiên vì interval sẽ chỉ chạy sau thời gian TIMEOUT
    checkAndRefreshToken({
      onSuccess: (role) => {
        console.log('🚀 first checkAndRefreshToken')
        setRole(role)
      },
      onError,
    })

    // Timeout interval phải nhỏ hơn thời gian hết hạn của access token
    // Ví dụ access token hết hạn sau 30s thì 10s chúng ta sẽ check refresh token 1 lần
    // TIMEOUT phải nhỏ hơn 1/3 thời gian hết hạn của access token
    const refreshTokenCheckInterval = ms(
      !role || role === 'Guest'
        ? envConfig.GUEST_REFRESH_TOKEN_CHECK_INTERVAL
        : envConfig.MANAGER_REFRESH_TOKEN_CHECK_INTERVAL
    )
    interval = setInterval(() => {
      checkAndRefreshToken({
        onSuccess: () => {
          console.log('🚀 other checkAndRefreshToken')
        },
        onError,
      })
    }, refreshTokenCheckInterval)

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [pathname, role, router, setRole])

  return null
}
