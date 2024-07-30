'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { redirect, useRouter } from 'next/navigation'

import { handleErrorApi } from '@/utils/error'
import { useAuthStore } from '@/lib/stores/auth-store'
import { GuestLoginBody, GuestLoginBodyType } from '@/lib/schema/guest.schema'
import { useGuestLoginToServerMutation } from '@/lib/tanstack-query/use-guest'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Form, FormField, FormItem, FormMessage } from '@/components/ui/form'

export default function GuestLoginForm({ tableNumber, token }: { tableNumber: number; token: string }) {
  const router = useRouter()

  const setRole = useAuthStore((state) => state.setRole)

  const form = useForm<GuestLoginBodyType>({
    resolver: zodResolver(GuestLoginBody),
    defaultValues: {
      name: '',
      token: token || '',
      tableNumber,
    },
  })

  const guestLoginToServerMutation = useGuestLoginToServerMutation()

  async function onValid(values: GuestLoginBodyType) {
    if (guestLoginToServerMutation.isPending) return

    try {
      const response = await guestLoginToServerMutation.mutateAsync(values)

      setRole(response.payload.data.guest.role)

      router.push('/guest/menu')
      router.refresh()
    } catch (error) {
      handleErrorApi({ error, setError: form.setError })
    }
  }

  if (!token) redirect('/')

  return (
    <Form {...form}>
      <form className="w-full max-w-[600px] shrink-0 space-y-2" noValidate onSubmit={form.handleSubmit(onValid)}>
        <div className="grid gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <div className="grid gap-2">
                  <Label htmlFor="name">Tên khách hàng</Label>
                  <Input id="name" type="text" placeholder="Bruce Wayne" required {...field} />
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full">
            Đăng nhập
          </Button>
        </div>
      </form>
    </Form>
  )
}
