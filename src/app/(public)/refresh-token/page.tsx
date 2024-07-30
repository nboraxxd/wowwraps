'use client'

import jwt from 'jsonwebtoken'
import { Suspense, useEffect } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import { checkAndRefreshToken } from '@/utils'
import { getRefreshTokenFromLocalStorage } from '@/utils/local-storage'
import { TokenPayload } from '@/types/jwt.types'
import { useAuthStore } from '@/lib/stores/auth-store'

function RefreshTokenPageWithoutSuspense() {
  const setRole = useAuthStore((state) => state.setRole)

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
          const refreshTokenDecoded = jwt.decode(refreshTokenFromUrl) as TokenPayload
          setRole(refreshTokenDecoded.role)

          const from = new URLSearchParams()
          from.set('from', pathname)

          router.push(nextPath ? `${nextPath}/?${from}` : `/?${from}`)
        },
      })
    } else {
      router.push('/')
    }
  }, [nextPath, pathname, refreshTokenFromUrl, router, setRole])

  return null
}

export default function RefreshTokenPage() {
  return (
    <Suspense>
      <RefreshTokenPageWithoutSuspense />
    </Suspense>
  )
}
