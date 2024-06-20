'use client'

import { useMemo, useRef, useState } from 'react'
import { LoaderCircleIcon, Upload } from 'lucide-react'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import {
  AccountResType,
  UpdateEmployeeAccountBody,
  UpdateEmployeeAccountBodyType,
} from '@/lib/schemaValidations/account.schema'
import { useUploadImageMutation } from '@/lib/tanstack-query/use-media'
import { useGetEmployeeQuery, useUpdateEmployeeMutation } from '@/lib/tanstack-query/use-account'
import { handleErrorApi } from '@/utils/error'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Form, FormField, FormItem, FormMessage } from '@/components/ui/form'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface Props {
  id?: number | undefined
  setId: (value: number | undefined) => void
  onSubmitSuccess?: () => void
}

export default function EditEmployee({ id, setId, onSubmitSuccess }: Props) {
  const [file, setFile] = useState<File | null>(null)

  const avatarInputRef = useRef<HTMLInputElement | null>(null)

  useGetEmployeeQuery(id, onGetEmployeeSuccess)

  const uploadImageMutation = useUploadImageMutation()

  const updateEmployeeMutation = useUpdateEmployeeMutation()

  const form = useForm<UpdateEmployeeAccountBodyType>({
    resolver: zodResolver(UpdateEmployeeAccountBody),
    defaultValues: {
      name: '',
      email: '',
      avatar: undefined,
      password: undefined,
      confirmPassword: undefined,
      changePassword: false,
    },
  })

  const avatar = form.watch('avatar')
  const name = form.watch('name')
  const changePassword = form.watch('changePassword')

  const previewAvatarFromFile = useMemo(() => {
    if (file) {
      return URL.createObjectURL(file)
    }
    return avatar
  }, [file, avatar])

  function onGetEmployeeSuccess(response: AccountResType) {
    const {
      data: { name, email, avatar },
    } = response

    form.reset({
      name,
      email,
      avatar: avatar ?? undefined,
      changePassword: form.getValues('changePassword'),
      password: form.getValues('password'),
      confirmPassword: form.getValues('confirmPassword'),
    })
  }

  async function onValid(values: UpdateEmployeeAccountBodyType) {
    if (uploadImageMutation.isPending || updateEmployeeMutation.isPending) return

    try {
      let body = { ...values }

      if (file) {
        const formData = new FormData()
        formData.append('file', file)

        const uploadImageResponse = await uploadImageMutation.mutateAsync(formData)
        const imageUrl = uploadImageResponse.payload.data

        body = { ...body, avatar: imageUrl }
      }

      const response = await updateEmployeeMutation.mutateAsync({ id: id!, ...body })

      toast.success(response.payload.message)

      onCloseDialog()
      onSubmitSuccess && onSubmitSuccess()
    } catch (error) {
      handleErrorApi({ error, setError: form.setError })
    }
  }

  function onCloseDialog() {
    setFile(null)
    form.reset()
    setId(undefined)
  }

  return (
    <Dialog
      open={Boolean(id)}
      onOpenChange={(open) => {
        if (!open) {
          onCloseDialog()
        }
      }}
    >
      <DialogContent className="max-h-screen overflow-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Cập nhật tài khoản</DialogTitle>
          <DialogDescription>Các trường tên, email, mật khẩu là bắt buộc</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            noValidate
            className="grid auto-rows-max items-start gap-4 md:gap-8"
            id="edit-employee-form"
            onSubmit={form.handleSubmit(onValid, console.log)}
          >
            <div className="grid gap-4 py-4">
              {/* Avatar */}
              <FormField
                control={form.control}
                name="avatar"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-start justify-start gap-2">
                      <Avatar className="aspect-square size-[100px] rounded-md object-cover">
                        <AvatarImage src={previewAvatarFromFile} />
                        <AvatarFallback className="rounded-none p-1.5 text-center">{name || 'Avatar'}</AvatarFallback>
                      </Avatar>
                      <input
                        type="file"
                        accept="image/*"
                        ref={avatarInputRef}
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            setFile(file)
                            field.onChange('http://localhost:3000/' + file.name)
                          }
                        }}
                        className="hidden"
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

              {/* Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                      <Label htmlFor="name">Tên</Label>
                      <div className="col-span-3 w-full space-y-2">
                        <Input id="name" className="w-full" autoComplete="name" {...field} />
                        <FormMessage />
                      </div>
                    </div>
                  </FormItem>
                )}
              />

              {/* Email */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                      <Label htmlFor="email">Email</Label>
                      <div className="col-span-3 w-full space-y-2">
                        <Input id="email" className="w-full" autoComplete="email" {...field} />
                        <FormMessage />
                      </div>
                    </div>
                  </FormItem>
                )}
              />

              {/* Change password toggle */}
              <FormField
                control={form.control}
                name="changePassword"
                render={({ field }) => (
                  <FormItem>
                    <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                      <Label htmlFor="email">Đổi mật khẩu</Label>
                      <div className="col-span-3 w-full space-y-2">
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                        <FormMessage />
                      </div>
                    </div>
                  </FormItem>
                )}
              />

              {/* New password */}
              {changePassword ? (
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                        <Label htmlFor="password">Mật khẩu mới</Label>
                        <div className="col-span-3 w-full space-y-2">
                          <Input
                            id="password"
                            className="w-full"
                            type="password"
                            autoComplete="new-password"
                            {...field}
                          />
                          <FormMessage />
                        </div>
                      </div>
                    </FormItem>
                  )}
                />
              ) : null}

              {/* Confirm password */}
              {changePassword ? (
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                        <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
                        <div className="col-span-3 w-full space-y-2">
                          <Input
                            id="confirmPassword"
                            className="w-full"
                            type="password"
                            autoComplete="new-password"
                            {...field}
                          />
                          <FormMessage />
                        </div>
                      </div>
                    </FormItem>
                  )}
                />
              ) : null}
            </div>
          </form>
        </Form>
        <DialogFooter>
          <Button
            type="submit"
            form="edit-employee-form"
            className="gap-1.5"
            disabled={uploadImageMutation.isPending || updateEmployeeMutation.isPending}
          >
            {uploadImageMutation.isPending || updateEmployeeMutation.isPending ? (
              <LoaderCircleIcon className="size-4 animate-spin" />
            ) : null}
            Lưu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
