'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { GuestLoginBody, GuestLoginBodyType } from '@/lib/schema/guest.schema'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Form, FormField, FormItem, FormMessage } from '@/components/ui/form'

export default function GuestLoginForm() {
  const form = useForm<GuestLoginBodyType>({
    resolver: zodResolver(GuestLoginBody),
    defaultValues: {
      name: '',
      token: '',
      tableNumber: 1,
    },
  })

  return (
    <Form {...form}>
      <form className="w-full max-w-[600px] shrink-0 space-y-2" noValidate>
        <div className="grid gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <div className="grid gap-2">
                  <Label htmlFor="name">Tên khách hàng</Label>
                  <Input id="name" type="text" required {...field} />
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
