'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

import { getRefreshTokenFromLocalStorage } from '@/utils/local-storage'
import { handleErrorApi } from '@/utils/error'
import { useAuthStore } from '@/lib/stores/auth-store'
import { useNLogoutToServerMutation } from '@/lib/tanstack-query/use-auth'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

export default function LogoutPage() {
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState('')

  const logOutRef = useRef<unknown>(null)

  const router = useRouter()

  const searchParams = useSearchParams()
  const refreshTokenFromUrl = searchParams.get('refresh-token')

  const setMe = useAuthStore((state) => state.setMe)
  const setIsAuth = useAuthStore((state) => state.setIsAuth)

  const { mutateAsync: nLogoutMutateAsync } = useNLogoutToServerMutation()

  useEffect(() => {
    if (logOutRef.current !== null || refreshTokenFromUrl !== getRefreshTokenFromLocalStorage()) return
    ;(async () => {
      logOutRef.current = nLogoutMutateAsync
      try {
        const response = await nLogoutMutateAsync()

        setIsAuth(false)
        setMe(null)
        setMessage(response.payload.message)

        setIsOpen(true)
        router.refresh()

        setTimeout(() => {
          logOutRef.current = null
        }, 10000)
      } catch (error) {
        handleErrorApi({ error })
      }
    })()
  }, [nLogoutMutateAsync, refreshTokenFromUrl, router, setIsAuth, setMe])

  function handleCloseDialog() {
    setIsOpen(false)
    router.push('/')
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger className="hidden">Open</DialogTrigger>
      <DialogContent onInteractOutside={handleCloseDialog}>
        <DialogHeader>
          <DialogTitle>Thông báo</DialogTitle>
          <DialogDescription>{message}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-start">
          <DialogClose asChild onClick={handleCloseDialog}>
            <Button type="button" variant="secondary">
              Đóng
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
