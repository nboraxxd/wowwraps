'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

import { useAuthStore } from '@/lib/stores/auth-store'

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
  const role = useAuthStore((state) => state.role)

  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return menuItems.map((item) =>
    item.authRequired === undefined ||
    (!role && !item.authRequired) ||
    ((role === 'Owner' || role === 'Employee') && item.authRequired) ? (
      <Link href={item.href} key={item.href} className={className}>
        {item.title}
      </Link>
    ) : null
  )
}
