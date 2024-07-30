import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

import { LoginResType } from '@/lib/schema/auth.schema'
import { GuestLoginResType } from '@/lib/schema/guest.schema'
import { RoleType } from '@/types/jwt.types'

type AuthStore = {
  isAuth: boolean
  setIsAuth: (isAuth: boolean) => void
  me: LoginResType['data']['account'] | GuestLoginResType['data']['guest'] | null
  setMe: (user: AuthStore['me']) => void
  role: RoleType | undefined
  setRole: (role: RoleType | undefined) => void
}

export const useAuthStore = create<AuthStore>()(
  devtools(
    (set) => ({
      isAuth: false,
      setIsAuth: (isAuth) => set({ isAuth }),
      me: null,
      setMe: (me) => set({ me }),
      role: undefined,
      setRole: (role) => set({ role }),
    }),
    {
      enabled: process.env.NODE_ENV === 'development',
      name: 'auth-store',
    }
  )
)
