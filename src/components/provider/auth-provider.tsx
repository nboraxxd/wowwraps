'use client'

import { useEffect } from 'react'

import { useAuthStore } from '@/lib/stores/auth-store'
import { getAccessTokenFromLocalStorage } from '@/utils/local-storage'

interface Props {
  children: React.ReactNode
}

export default function AuthProvider({ children }: Props) {
  const setIsAuth = useAuthStore((state) => state.setIsAuth)

  useEffect(() => {
    setIsAuth(Boolean(getAccessTokenFromLocalStorage()))
  }, [setIsAuth])

  return children
}
