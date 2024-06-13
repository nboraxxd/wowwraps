'use client'

import Link from 'next/link'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

import { handleErrorApi } from '@/utils/error'
import { useAuthStore } from '@/lib/stores/auth-store'
import { useNLogoutMutation } from '@/lib/tanstack-query/use-auth'
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

const account = {
  name: 'Nguyễn Văn A',
  avatar: 'https://i.pravatar.cc/150',
}

export default function DropdownAvatar() {
  const router = useRouter()

  const setMe = useAuthStore((state) => state.setMe)
  const setIsAuth = useAuthStore((state) => state.setIsAuth)

  const nLogoutMutation = useNLogoutMutation()

  function handleLogout() {
    if (nLogoutMutation.isPending) return

    nLogoutMutation.mutate(undefined, {
      onSuccess: (response) => {
        setIsAuth(false)
        setMe(null)
        toast(response.payload.message)

        router.refresh()
      },
      onError: (error) => {
        handleErrorApi({ error })
      },
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="overflow-hidden rounded-full">
          <Avatar>
            <AvatarImage src={account.avatar ?? undefined} alt={account.name} />
            <AvatarFallback>{account.name.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>{account.name}</DropdownMenuLabel>
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
  )
}
