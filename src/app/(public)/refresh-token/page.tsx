'use client'

import { useEffect } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import { checkAndRefreshToken } from '@/utils'
import { getRefreshTokenFromLocalStorage } from '@/utils/local-storage'
import { useAuthStore } from '@/lib/stores/auth-store'

export default function RefreshTokenPage() {
  const setIsAuth = useAuthStore((state) => state.setIsAuth)

  const router = useRouter()
  const pathname = usePathname()

  const searchParams = useSearchParams()
  const nextPath = searchParams.get('next')
  const refreshTokenFromUrl = searchParams.get('refresh-token')

  useEffect(() => {
    if (refreshTokenFromUrl && refreshTokenFromUrl === getRefreshTokenFromLocalStorage()) {
      checkAndRefreshToken({
        onSuccess: () => {
          console.log('🚀 super first checkAndRefreshToken')
          setIsAuth(true)

          const from = new URLSearchParams()
          from.set('from', pathname)

          router.push(nextPath ? `${nextPath}/?${from}` : `/?${from}`)
        },
      })
    } else {
      router.push('/')
    }
  }, [nextPath, pathname, refreshTokenFromUrl, router, setIsAuth])

  return null
}
