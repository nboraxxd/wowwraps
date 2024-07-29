'use client'

import { toast } from 'sonner'
import { LoaderCircleIcon } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { handleErrorApi } from '@/utils/error'
import { useAuthStore } from '@/lib/stores/auth-store'
import { useChangePasswordMutation, useGetMeQuery } from '@/lib/tanstack-query/use-account'
import { ChangePasswordBody, ChangePasswordBodyType } from '@/lib/schema/account.schema'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function ChangePasswordForm() {
  const isAuth = useAuthStore((state) => state.isAuth)

  const { data: getMeResponse } = useGetMeQuery({
    enabled: isAuth,
  })

  const changePasswordMutation = useChangePasswordMutation()

  const form = useForm<ChangePasswordBodyType>({
    resolver: zodResolver(ChangePasswordBody),
    defaultValues: {
      oldPassword: '',
      password: '',
      confirmPassword: '',
    },
  })

  async function onValid(values: ChangePasswordBodyType) {
    if (changePasswordMutation.isPending) return

    try {
      const response = await changePasswordMutation.mutateAsync(values)

      form.reset()
      toast.success(response.payload.message)
    } catch (error) {
      handleErrorApi({ error, setError: form.setError })
    }
  }

  return (
    <Form {...form}>
      <form noValidate className="grid auto-rows-max items-start gap-4 md:gap-8" onSubmit={form.handleSubmit(onValid)}>
        <Card className="overflow-hidden" x-chunk="dashboard-07-chunk-4">
          <CardHeader>
            <CardTitle>Đổi mật khẩu</CardTitle>
            {/* <CardDescription>Lipsum dolor sit amet, consectetur adipiscing elit</CardDescription> */}
          </CardHeader>
          <CardContent>
            <div className="grid gap-6">
              {/* Email */}
              <div className="hidden">
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    autoComplete="email"
                    disabled
                    readOnly
                    defaultValue={getMeResponse?.payload.data.email}
                  />
                </FormControl>
              </div>

              {/* Old password */}
              <FormField
                control={form.control}
                name="oldPassword"
                render={({ field }) => (
                  <FormItem>
                    <div className="grid gap-3">
                      <Label htmlFor="oldPassword">Mật khẩu cũ</Label>
                      <Input
                        id="oldPassword"
                        type="password"
                        autoComplete="current-password"
                        className="w-full"
                        {...field}
                      />
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="grid gap-3">
                      <Label htmlFor="password">Mật khẩu mới</Label>
                      <Input id="password" type="password" autoComplete="new-password" className="w-full" {...field} />
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <div className="grid gap-3">
                      <Label htmlFor="confirmPassword">Nhập lại mật khẩu mới</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        autoComplete="new-password"
                        className="w-full"
                        {...field}
                      />
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
              <div className=" flex items-center gap-2 md:ml-auto">
                <Button size="sm" type="submit" className="gap-1" disabled={changePasswordMutation.isPending}>
                  {changePasswordMutation.isPending ? <LoaderCircleIcon className="size-4 animate-spin" /> : null}
                  Đổi mật khẩu
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </form>
    </Form>
  )
}
