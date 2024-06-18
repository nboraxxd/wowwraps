'use client'

import jwt from 'jsonwebtoken'
import { useEffect } from 'react'

import { TokenPayload } from '@/types/jwt.types'
import { useAuthStore } from '@/lib/stores/auth-store'
import { getAccessTokenFromLocalStorage } from '@/utils/local-storage'

interface Props {
  children: React.ReactNode
}

export default function AuthProvider({ children }: Props) {
  const setIsAuth = useAuthStore((state) => state.setIsAuth)

  useEffect(() => {
    const isAuth = () => {
      const accessToken = getAccessTokenFromLocalStorage()

      const accessTokenDecoded = accessToken ? (jwt.decode(accessToken) as TokenPayload) : null

      const now = Math.floor(new Date().getTime() / 1000)

      return accessTokenDecoded ? accessTokenDecoded.exp > now : false
    }

    setIsAuth(isAuth())
  }, [setIsAuth])

  return children
}
