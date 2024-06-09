'use client'

import Link from 'next/link'
import { useEffect } from 'react'

import { useAuthStore } from '@/lib/stores/auth-store'
import { getAccessTokenFromLocalStorage } from '@/utils/token'

// authRequired = undefined: always show
// authRequired = false: only show when user is not authenticated
// authRequired = true: only show when user is authenticated
const menuItems = [
  {
    title: 'Món ăn',
    href: '/menu',
  },
  {
    title: 'Đơn hàng',
    href: '/orders',
    authRequired: true,
  },
  {
    title: 'Đăng nhập',
    href: '/login',
    authRequired: false,
  },
  {
    title: 'Quản lý',
    href: '/manage/dashboard',
    authRequired: true,
  },
]

export default function NavItems({ className }: { className?: string }) {
  const isAuth = useAuthStore((state) => state.isAuth)
  const setIsAuth = useAuthStore((state) => state.setIsAuth)

  useEffect(() => {
    setIsAuth(Boolean(getAccessTokenFromLocalStorage()))
  }, [setIsAuth])

  return menuItems.map((item) =>
    item.authRequired === undefined || (!isAuth && !item.authRequired) || (isAuth && item.authRequired) ? (
      <Link href={item.href} key={item.href} className={className}>
        {item.title}
      </Link>
    ) : null
  )
}
