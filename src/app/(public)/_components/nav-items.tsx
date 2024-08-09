'use client'

import Link from 'next/link'
import { toast } from 'sonner'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

import { Role } from '@/constants/type'
import { RoleType } from '@/types/jwt.types'
import { cn } from '@/utils'
import { handleErrorApi } from '@/utils/error'
import { useAuthStore } from '@/lib/stores/auth-store'
import { useLogoutToServerMutation } from '@/lib/tanstack-query/use-auth'
import { useGuestLogoutToServerMutation } from '@/lib/tanstack-query/use-guest'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { buttonVariants } from '@/components/ui/button'

const menuItems: {
  title: string
  href: string
  role?: RoleType[]
  hideWhenLoggedIn?: boolean
}[] = [
  {
    title: 'Trang chủ',
    href: '/',
    role: [Role.Guest, Role.Owner, Role.Employee],
  },
  {
    title: 'Đăng nhập',
    href: '/login',
    hideWhenLoggedIn: true,
  },
  {
    title: 'Menu',
    href: '/guest/menu',
    role: [Role.Guest],
  },
  {
    title: 'Đơn hàng',
    href: '/guest/orders',
    role: [Role.Guest],
  },
  {
    title: 'Quản lý',
    href: '/manage/dashboard',
    role: [Role.Owner, Role.Employee],
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
      {menuItems.map((item) => {
        return (role && item.role && item.role.includes(role)) || (!role && item.hideWhenLoggedIn === true) ? (
          <Link href={item.href} key={item.href} className={className}>
            {item.title}
          </Link>
        ) : null
      })}
      {role ? (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button className={cn('text-left', className)}>Đăng xuất</button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Bạn có chắc chắn muốn đăng xuất không?</AlertDialogTitle>
              <AlertDialogDescription>
                Các món ăn trong giỏ hàng sẽ bị xóa hết, bạn có chắc chắn muốn đăng xuất không?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Huỷ</AlertDialogCancel>
              <AlertDialogAction onClick={handleLogout} className={cn(buttonVariants({ variant: 'destructive' }))}>
                Đăng xuất
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ) : undefined}
    </>
  )
}
