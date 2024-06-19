'use client'

import { toast } from 'sonner'
import { Suspense, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

import { useAuthStore } from '@/lib/stores/auth-store'
import { useLogoutToServerMutation } from '@/lib/tanstack-query/use-auth'
import { handleErrorApi } from '@/utils/error'
import { getAccessTokenFromLocalStorage, getRefreshTokenFromLocalStorage } from '@/utils/local-storage'

function LogoutPageWithoutSuspense() {
  // Prevent multiple requests
  const logOutRef = useRef<unknown>(null)

  const router = useRouter()

  const searchParams = useSearchParams()
  const accessTokenFromUrl = searchParams.get('access-token')
  const refreshTokenFromUrl = searchParams.get('refresh-token')

  const setMe = useAuthStore((state) => state.setMe)
  const setIsAuth = useAuthStore((state) => state.setIsAuth)

  const { mutateAsync: nLogoutMutateAsync } = useLogoutToServerMutation()

  useEffect(() => {
    let timeout: NodeJS.Timeout | null = null

    if (
      !logOutRef.current &&
      ((accessTokenFromUrl && accessTokenFromUrl === getAccessTokenFromLocalStorage()) ||
        (refreshTokenFromUrl && refreshTokenFromUrl === getRefreshTokenFromLocalStorage()))
    ) {
      ;(async () => {
        logOutRef.current = nLogoutMutateAsync
        try {
          const response = await nLogoutMutateAsync()

          setIsAuth(false)
          setMe(null)
          toast(response.payload.message)
          router.push('/')
          router.refresh()

          timeout = setTimeout(() => {
            logOutRef.current = null
          }, 1000)
        } catch (error) {
          handleErrorApi({ error })
        }
      })()
    } else {
      router.push('/')
    }

    return () => {
      if (timeout) clearTimeout(timeout)
    }
  }, [accessTokenFromUrl, nLogoutMutateAsync, refreshTokenFromUrl, router, setIsAuth, setMe])

  return null
}

export default function LogoutPage() {
  return (
    <Suspense>
      <LogoutPageWithoutSuspense />
    </Suspense>
  )
}
