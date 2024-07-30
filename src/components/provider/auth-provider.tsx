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
  const setRole = useAuthStore((state) => state.setRole)

  useEffect(() => {
    const getRole = () => {
      const accessToken = getAccessTokenFromLocalStorage()
      if (!accessToken) return undefined

      const accessTokenDecoded = jwt.decode(accessToken) as TokenPayload
      const now = Math.floor(new Date().getTime() / 1000)

      return accessTokenDecoded.exp > now ? accessTokenDecoded.role : undefined
    }

    setRole(getRole())
  }, [setRole])

  return children
}
