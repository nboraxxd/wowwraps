'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

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
  const [isAuth, setIsAuth] = useState(false)

  useEffect(() => {
    setIsAuth(Boolean(getAccessTokenFromLocalStorage()))
  }, [])

  return menuItems.map((item) =>
    item.authRequired === undefined || (item.authRequired && isAuth) || (!item.authRequired && !isAuth) ? (
      <Link href={item.href} key={item.href} className={className}>
        {item.title}
      </Link>
    ) : null
  )
}
