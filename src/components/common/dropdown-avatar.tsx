'use client'

import Link from 'next/link'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

import { handleErrorApi } from '@/utils/error'
import { useAuthStore } from '@/lib/stores/auth-store'
import { useGetMeQuery } from '@/lib/tanstack-query/use-account'
import { useLogoutToServerMutation } from '@/lib/tanstack-query/use-auth'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'

export default function DropdownAvatar() {
  const router = useRouter()

  const setMe = useAuthStore((state) => state.setMe)
  const isAuth = useAuthStore((state) => state.isAuth)
  const setIsAuth = useAuthStore((state) => state.setIsAuth)

  const {
    data: getMeResponse,
    isLoading: isLoadingGetMe,
    isSuccess: isSuccessGetMe,
  } = useGetMeQuery({ enabled: isAuth, onSuccess: (data) => setMe(data.data) })

  const logoutToServerMutation = useLogoutToServerMutation()

  async function handleLogout() {
    if (logoutToServerMutation.isPending) return

    try {
      const response = await logoutToServerMutation.mutateAsync()

      setIsAuth(false)
      setMe(null)
      toast(response.payload.message)

      router.push('/')
      router.refresh()
    } catch (error) {
      handleErrorApi({ error })
    }
  }

  if (isLoadingGetMe) return <Skeleton className="size-9 rounded-full" />

  return isAuth && isSuccessGetMe ? (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="overflow-hidden rounded-full">
          <Avatar>
            <AvatarImage src={getMeResponse.payload.data.avatar ?? undefined} alt={getMeResponse.payload.data.name} />
            <AvatarFallback>{getMeResponse.payload.data.name.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>{getMeResponse.payload.data.name}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={'/manage/setting'} className="cursor-pointer">
            Cài đặt
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer">Hỗ trợ</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer" onClick={handleLogout}>
          Đăng xuất
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ) : null
}
