'use client'

import { Upload } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { useAuthStore } from '@/lib/stores/auth-store'
import { useGetMe } from '@/lib/tanstack-query/use-account'
import { UpdateMeBody, UpdateMeBodyType } from '@/lib/schemaValidations/account.schema'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Form, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function UpdateProfileForm() {
  const [file, setFile] = useState<File | null>(null)

  const avatarInputRef = useRef<HTMLInputElement>(null)

  const isAuth = useAuthStore((state) => state.isAuth)

  const { data: getMeResponse, isSuccess: isSuccessGetMe } = useGetMe({
    enabled: isAuth,
  })

  const form = useForm<UpdateMeBodyType>({
    resolver: zodResolver(UpdateMeBody),
    defaultValues: {
      name: '',
      avatar: '',
    },
  })

  const avatar = form.watch('avatar')
  const name = form.watch('name')

  const previewAvatar = useMemo(() => {
    if (file) {
      return URL.createObjectURL(file)
    }
    return avatar
  }, [avatar, file])

  useEffect(() => {
    isSuccessGetMe &&
      form.reset({ name: getMeResponse.payload.data.name, avatar: getMeResponse.payload.data.avatar ?? '' })
  }, [form, getMeResponse?.payload.data.avatar, getMeResponse?.payload.data.name, isSuccessGetMe])

  function onChangeAvatarInput(ev: React.ChangeEvent<HTMLInputElement>) {
    const file = ev.target.files?.[0]

    if (file) {
      setFile(file)
    }
  }

  return (
    <Form {...form}>
      <form noValidate className="grid auto-rows-max items-start gap-4 md:gap-8">
        <Card x-chunk="dashboard-07-chunk-0">
          <CardHeader>
            <CardTitle>Thông tin cá nhân</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6">
              <FormField
                control={form.control}
                name="avatar"
                render={({ field: _field }) => (
                  <FormItem>
                    <div className="flex items-start justify-start gap-2">
                      <Avatar className="aspect-square size-[100px] rounded-md object-cover">
                        <AvatarImage src={previewAvatar} />
                        <AvatarFallback className="rounded-none">{name}</AvatarFallback>
                      </Avatar>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        ref={avatarInputRef}
                        onChange={onChangeAvatarInput}
                      />
                      <button
                        className="flex aspect-square w-[100px] items-center justify-center rounded-md border border-dashed"
                        type="button"
                        onClick={() => avatarInputRef.current?.click()}
                      >
                        <Upload className="size-4 text-muted-foreground" />
                        <span className="sr-only">Upload</span>
                      </button>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <div className="grid gap-3">
                      <Label htmlFor="name">Tên</Label>
                      <Input id="name" type="text" className="w-full" {...field} />
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />

              <div className=" flex items-center gap-2 md:ml-auto">
                <Button variant="outline" size="sm" type="reset">
                  Hủy
                </Button>
                <Button size="sm" type="submit">
                  Lưu thông tin
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </form>
    </Form>
  )
}
