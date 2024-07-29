import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

import { LoginResType } from '@/lib/schema/auth.schema'

type AuthStore = {
  isAuth: boolean
  setIsAuth: (isAuth: boolean) => void
  me: LoginResType['data']['account'] | null
  setMe: (user: AuthStore['me']) => void
}

export const useAuthStore = create<AuthStore>()(
  devtools(
    (set) => ({
      isAuth: false,
      setIsAuth: (isAuth) => set({ isAuth }),
      me: null,
      setMe: (me) => set({ me }),
    }),
    {
      enabled: process.env.NODE_ENV === 'development',
      name: 'auth-store',
    }
  )
)
