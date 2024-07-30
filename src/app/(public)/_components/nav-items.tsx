'use client'

import Link from 'next/link'
import { toast } from 'sonner'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

import { cn } from '@/utils'
import { handleErrorApi } from '@/utils/error'
import { useAuthStore } from '@/lib/stores/auth-store'
import { useLogoutToServerMutation } from '@/lib/tanstack-query/use-auth'
import { useGuestLogoutToServerMutation } from '@/lib/tanstack-query/use-guest'

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
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  const role = useAuthStore((state) => state.role)
  const setRole = useAuthStore((state) => state.setRole)

  const logoutToServerMutation = useLogoutToServerMutation()
  const guestLogoutToServerMutation = useGuestLogoutToServerMutation()

  useEffect(() => {
    setMounted(true)
  }, [])

  async function handleLogout() {
    if (!role || logoutToServerMutation.isPending || guestLogoutToServerMutation.isPending) return

    try {
      const response =
        role === 'Guest' ? await guestLogoutToServerMutation.mutateAsync() : await logoutToServerMutation.mutateAsync()

      setRole(undefined)
      toast(response.payload.message)

      router.push('/')
      router.refresh()
    } catch (error) {
      handleErrorApi({ error })
    }
  }

  if (!mounted) return null

  return (
    <>
      {menuItems.map((item) =>
        item.authRequired === undefined ||
        (!role && !item.authRequired) ||
        ((role === 'Owner' || role === 'Employee') && item.authRequired) ? (
          <Link href={item.href} key={item.href} className={className}>
            {item.title}
          </Link>
        ) : null
      )}
      {role ? (
        <button className={cn('text-left', className)} onClick={handleLogout}>
          Đăng xuất
        </button>
      ) : undefined}
    </>
  )
}
