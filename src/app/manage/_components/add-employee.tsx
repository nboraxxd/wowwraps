'use client'

import { toast } from 'sonner'
import { useMemo, useRef, useState } from 'react'
import { PlusCircle, Upload } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { handleErrorApi } from '@/utils/error'
import { useUploadImageMutation } from '@/lib/tanstack-query/use-media'
import { useAddEmployeeMutation } from '@/lib/tanstack-query/use-account'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Form, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { CreateEmployeeAccountBody, CreateEmployeeAccountBodyType } from '@/lib/schemaValidations/account.schema'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

export default function AddEmployee() {
  const [file, setFile] = useState<File | null>(null)
  const [open, setOpen] = useState(false)

  const avatarInputRef = useRef<HTMLInputElement | null>(null)

  const uploadImageMutation = useUploadImageMutation()
  const addEmployeeMutation = useAddEmployeeMutation()

  const form = useForm<CreateEmployeeAccountBodyType>({
    resolver: zodResolver(CreateEmployeeAccountBody),
    defaultValues: {
      name: '',
      email: '',
      avatar: undefined,
      password: '',
      confirmPassword: '',
    },
  })

  const avatar = form.watch('avatar')
  const name = form.watch('name')

  const previewAvatarFromFile = useMemo(() => {
    if (file) {
      return URL.createObjectURL(file)
    }
    return avatar
  }, [file, avatar])

  async function onValid(values: CreateEmployeeAccountBodyType) {
    if (uploadImageMutation.isPending || addEmployeeMutation.isPending) return

    try {
      let body = { ...values }

      if (file) {
        const formData = new FormData()
        formData.append('file', file)

        const uploadImageResponse = await uploadImageMutation.mutateAsync(formData)
        const imageUrl = uploadImageResponse.payload.data

        body = { ...body, avatar: imageUrl }
      }

      const response = await addEmployeeMutation.mutateAsync(body)

      toast.success(response.payload.message)
      form.reset()
      setOpen(false)
    } catch (error) {
      handleErrorApi({ error, setError: form.setError })
    }
  }

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button size="sm" className="h-7 gap-1">
          <PlusCircle className="size-3.5" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Tạo tài khoản</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-screen overflow-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Tạo tài khoản</DialogTitle>
          <DialogDescription>Các trường tên, email, mật khẩu là bắt buộc</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            noValidate
            className="grid auto-rows-max items-start gap-4 md:gap-8"
            id="add-employee-form"
            onSubmit={form.handleSubmit(onValid)}
          >
            <div className="grid gap-4 py-4">
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
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                      <Label htmlFor="password">Mật khẩu</Label>
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
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                      <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
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
            </div>
          </form>
        </Form>
        <DialogFooter>
          <Button type="submit" form="add-employee-form">
            Thêm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
