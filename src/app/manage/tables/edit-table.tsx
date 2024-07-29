'use client'

import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { handleErrorApi } from '@/utils/error'
import { TableStatus, TableStatusValues } from '@/constants/type'
import { getTableLink, getVietnameseTableStatus } from '@/utils'
import { useGetTableQuery, useUpdateTableMutation } from '@/lib/tanstack-query/use-table'
import { TableResType, UpdateTableBody, UpdateTableBodyType } from '@/lib/schema/table.schema'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import QRCodeTable from '@/app/manage/tables/qrcode-table'
import Link from 'next/link'

interface Props {
  id?: number | undefined
  setId: (value: number | undefined) => void
  onSubmitSuccess?: () => void
}

export default function EditTable({ id, setId, onSubmitSuccess }: Props) {
  const form = useForm<UpdateTableBodyType>({
    resolver: zodResolver(UpdateTableBody),
    defaultValues: {
      capacity: 2,
      status: TableStatus.Hidden,
      changeToken: false,
    },
  })

  const { data: tableData } = useGetTableQuery(id, onGetTableSuccess)
  const updateTableMutation = useUpdateTableMutation()

  function onGetTableSuccess(response: TableResType) {
    const {
      data: { capacity, status },
    } = response

    form.reset({ capacity, status, changeToken: form.getValues('changeToken') })
  }

  async function onValid(values: UpdateTableBodyType) {
    if (!id || updateTableMutation.isPending) return

    try {
      const updateDishResponse = await updateTableMutation.mutateAsync({ ...values, number: id })

      onSubmitSuccess && onSubmitSuccess()

      toast.success(updateDishResponse.payload.message)
      form.reset()
      setId(undefined)
    } catch (error) {
      handleErrorApi({ error, setError: form.setError })
    }
  }

  return (
    <Dialog
      open={Boolean(id)}
      onOpenChange={(value) => {
        if (!value) {
          setId(undefined)
        }
      }}
    >
      <DialogContent
        className="max-h-screen overflow-auto sm:max-w-[600px]"
        onCloseAutoFocus={() => {
          form.reset()
          setId(undefined)
        }}
      >
        <DialogHeader>
          <DialogTitle>Cập nhật bàn ăn</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            noValidate
            className="grid auto-rows-max items-start gap-4 md:gap-8"
            id="edit-table-form"
            onSubmit={form.handleSubmit(onValid, (err) => console.log(err))}
          >
            <div className="grid gap-4 py-4">
              <FormItem>
                <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                  <Label htmlFor="name">Số hiệu bàn</Label>
                  <div className="col-span-3 w-full space-y-2">
                    {tableData ? (
                      <Input
                        id="number"
                        type="number"
                        className="w-full"
                        value={tableData.payload.data.number}
                        readOnly
                      />
                    ) : null}
                    <FormMessage />
                  </div>
                </div>
              </FormItem>
              <FormField
                control={form.control}
                name="capacity"
                render={({ field }) => (
                  <FormItem>
                    <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                      <Label htmlFor="price">Sức chứa (người)</Label>
                      <div className="col-span-3 w-full space-y-2">
                        <Input id="capacity" className="w-full" {...field} type="number" />
                        <FormMessage />
                      </div>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                      <Label htmlFor="description">Trạng thái</Label>
                      <div className="col-span-3 w-full space-y-2">
                        <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn trạng thái" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {TableStatusValues.map((status) => (
                              <SelectItem key={status} value={status}>
                                {getVietnameseTableStatus(status)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="changeToken"
                render={({ field }) => (
                  <FormItem>
                    <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                      <Label htmlFor="changeToken">Đổi QR Code</Label>
                      <div className="col-span-3 w-full space-y-2">
                        <div className="flex items-center space-x-2">
                          <Switch id="changeToken" checked={field.value} onCheckedChange={field.onChange} />
                        </div>
                      </div>

                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
              <FormItem>
                <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                  <Label>QR Code</Label>
                  <div className="col-span-3 w-full space-y-2">
                    {tableData ? (
                      <QRCodeTable
                        tableNumber={tableData.payload.data.number}
                        tableToken={tableData.payload.data.token}
                      />
                    ) : null}
                  </div>
                </div>
              </FormItem>
              <FormItem>
                <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                  <Label>URL gọi món</Label>
                  <div className="col-span-3 w-full space-y-2">
                    {tableData ? (
                      <Link
                        href={getTableLink({
                          tableToken: tableData.payload.data.token,
                          tableNumber: tableData.payload.data.number,
                        })}
                        target="_blank"
                        className="break-all"
                      >
                        {getTableLink({
                          tableToken: tableData.payload.data.token,
                          tableNumber: tableData.payload.data.number,
                        })}
                      </Link>
                    ) : null}
                  </div>
                </div>
              </FormItem>
            </div>
          </form>
        </Form>
        <DialogFooter>
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              form.reset()
              setId(undefined)
            }}
          >
            Hủy
          </Button>
          <Button type="submit" form="edit-table-form">
            Lưu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
