'use client'

import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { LoaderCircleIcon, Upload } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'

import { handleErrorApi } from '@/utils/error'
import { useAuthStore } from '@/lib/stores/auth-store'
import { useUploadImageMutation } from '@/lib/tanstack-query/use-media'
import { useGetMeQuery, useUpdateMeMutation } from '@/lib/tanstack-query/use-account'
import { UpdateMeBody, UpdateMeBodyType } from '@/lib/schema/account.schema'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Form, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function UpdateProfileForm() {
  const [file, setFile] = useState<File | null>(null)

  const avatarInputRef = useRef<HTMLInputElement>(null)

  const role = useAuthStore((state) => state.role)

  const { data: getMeResponse, isSuccess: isSuccessGetMe } = useGetMeQuery({
    enabled: role === 'Owner' || role === 'Employee',
  })

  const updateMeMutation = useUpdateMeMutation()

  const uploadImageMutation = useUploadImageMutation()

  const form = useForm<UpdateMeBodyType>({
    resolver: zodResolver(UpdateMeBody),
    defaultValues: {
      name: '',
      avatar: undefined,
    },
  })

  const avatar = form.watch('avatar')

  const previewAvatar = useMemo(() => {
    if (file) {
      return URL.createObjectURL(file)
    }
    return avatar
  }, [avatar, file])

  useEffect(() => {
    isSuccessGetMe &&
      form.reset({ name: getMeResponse.payload.data.name, avatar: getMeResponse.payload.data.avatar ?? undefined })
  }, [form, getMeResponse?.payload.data.avatar, getMeResponse?.payload.data.name, isSuccessGetMe])

  function onReset() {
    setFile(null)
    form.reset()
  }

  async function onValid(values: UpdateMeBodyType) {
    if (uploadImageMutation.isPending || updateMeMutation.isPending) return

    try {
      let body = { ...values }

      if (file) {
        const formData = new FormData()
        formData.append('avatar', file)

        const uploadImageResponse = await uploadImageMutation.mutateAsync(formData)
        const imageUrl = uploadImageResponse.payload.data

        body = { ...body, avatar: imageUrl }
      }

      const response = await updateMeMutation.mutateAsync(body)

      // Không cần phải refreshGetMe vì nó đã được tự động thực hiện bởi onSuccess của useUpdateMeMutation
      // refreshGetMe()

      toast.success(response.payload.message)
    } catch (error) {
      handleErrorApi({ error, setError: form.setError })
    }
  }

  return (
    <Form {...form}>
      <form
        noValidate
        className="grid auto-rows-max items-start gap-4 md:gap-8"
        onReset={onReset}
        onSubmit={form.handleSubmit(onValid)}
      >
        <Card x-chunk="dashboard-07-chunk-0">
          <CardHeader>
            <CardTitle>Thông tin cá nhân</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6">
              <FormField
                control={form.control}
                name="avatar"
                render={() => (
                  <FormItem>
                    <div className="flex items-start justify-start gap-2">
                      <Avatar className="aspect-square size-[100px] rounded-md object-cover">
                        <AvatarImage src={previewAvatar} />
                        <AvatarFallback className="rounded-none p-1.5 text-center">
                          {getMeResponse?.payload.data.name}
                        </AvatarFallback>
                      </Avatar>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        ref={avatarInputRef}
                        onChange={(ev) => {
                          const file = ev.target.files?.[0]
                          file && setFile(file)
                        }}
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
                <Button
                  variant="outline"
                  size="sm"
                  type="reset"
                  disabled={uploadImageMutation.isPending || updateMeMutation.isPending}
                >
                  Reset
                </Button>
                <Button
                  size="sm"
                  type="submit"
                  className="gap-1.5"
                  disabled={uploadImageMutation.isPending || updateMeMutation.isPending}
                >
                  {uploadImageMutation.isPending || updateMeMutation.isPending ? (
                    <LoaderCircleIcon className="size-4 animate-spin" />
                  ) : null}
                  Cập nhật
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </form>
    </Form>
  )
}
