'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import {
  getAccessTokenFromLocalStorage,
  getRefreshTokenFromLocalStorage,
  removeTokensFromLocalStorage,
} from '@/utils/local-storage'
import { handleErrorApi } from '@/utils/error'
import { useAuthStore } from '@/lib/stores/auth-store'
import { useLoginToServerMutation } from '@/lib/tanstack-query/use-auth'
import { LoginBody, LoginBodyType } from '@/lib/schema/auth.schema'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Form, FormField, FormItem, FormMessage } from '@/components/ui/form'

export default function LoginForm() {
  const router = useRouter()
  const pathname = usePathname()

  const searchParams = useSearchParams()
  const next = searchParams.get('next')

  const setRole = useAuthStore((state) => state.setRole)

  const form = useForm<LoginBodyType>({
    resolver: zodResolver(LoginBody),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const loginToServerMutation = useLoginToServerMutation()

  useEffect(() => {
    const accessToken = getAccessTokenFromLocalStorage()
    const refreshToken = getRefreshTokenFromLocalStorage()

    if (next && (accessToken || refreshToken)) {
      removeTokensFromLocalStorage()
    }
  }, [next])

  async function onValid(values: LoginBodyType) {
    if (loginToServerMutation.isPending) return

    try {
      const response = await loginToServerMutation.mutateAsync(values)

      setRole(response.payload.data.account.role)

      const from = new URLSearchParams()
      from.set('from', pathname)

      router.push(next ? `${next}/?${from}` : '/')
      router.refresh()
    } catch (error) {
      handleErrorApi({ error, setError: form.setError })
    }
  }

  return (
    <Form {...form}>
      <form className="w-full max-w-[600px] shrink-0 space-y-2" noValidate onSubmit={form.handleSubmit(onValid)}>
        <div className="grid gap-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="bruce@wayne.dc"
                    required
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
                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label htmlFor="password">Password</Label>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Please enter your password"
                    autoComplete="new-password"
                    required
                    {...field}
                  />
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full">
            Đăng nhập
          </Button>
          <Button variant="outline" className="w-full" type="button">
            Đăng nhập bằng Google
          </Button>
        </div>
      </form>
    </Form>
  )
}
