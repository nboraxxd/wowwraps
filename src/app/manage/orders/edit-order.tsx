'use client'

import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { useEffect, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'

import { handleErrorApi } from '@/utils/error'
import { getVietnameseOrderStatus } from '@/utils'
import { OrderStatus, OrderStatusValues } from '@/constants/type'
import { DishListResType } from '@/lib/schema/dish.schema'
import { UpdateOrderBody, UpdateOrderBodyType } from '@/lib/schema/order.schema'
import { useGetOrderDetailQuery, useUpdateOrderMutation } from '@/lib/tanstack-query/use-order'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { DishesDialog } from '@/app/manage/orders/dishes-dialog'

export default function EditOrder({
  id,
  setId,
  onSubmitSuccess,
}: {
  id?: number | undefined
  setId: (value: number | undefined) => void
  onSubmitSuccess?: () => void
}) {
  const { data: orderDetail, isSuccess: isSuccessGetOrderDetail } = useGetOrderDetailQuery(id as number, Boolean(id))
  const updateOrderMutation = useUpdateOrderMutation()

  const [selectedDish, setSelectedDish] = useState<DishListResType['data'][0] | null>(null)

  const form = useForm<UpdateOrderBodyType>({
    resolver: zodResolver(UpdateOrderBody),
    defaultValues: {
      status: OrderStatus.Pending,
      dishId: 0,
      quantity: 1,
    },
  })

  useEffect(() => {
    if (isSuccessGetOrderDetail) {
      const {
        status,
        dishSnapshot: { dishId },
        quantity,
      } = orderDetail.payload.data

      form.reset({ status, dishId: dishId ?? undefined, quantity })
      setSelectedDish(orderDetail.payload.data.dishSnapshot)
    }
  }, [form, isSuccessGetOrderDetail, orderDetail?.payload.data])

  const onSubmit = async (values: UpdateOrderBodyType) => {
    if (updateOrderMutation.isPending) return

    try {
      const response = await updateOrderMutation.mutateAsync({ orderId: id as number, ...values })

      toast.success(response.payload.message)
      reset()
      onSubmitSuccess && onSubmitSuccess()
    } catch (error) {
      handleErrorApi({ error })
    }
  }

  const reset = () => {
    setId(undefined)
  }

  return (
    <Dialog
      open={Boolean(id)}
      onOpenChange={(value) => {
        if (!value) {
          reset()
        }
      }}
    >
      <DialogContent className="max-h-screen overflow-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Cập nhật đơn hàng</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            noValidate
            className="grid auto-rows-max items-start gap-4 md:gap-8"
            id="edit-order-form"
            onSubmit={form.handleSubmit(onSubmit, console.log)}
          >
            <div className="grid gap-4 py-4">
              <FormField
                control={form.control}
                name="dishId"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-4 items-center justify-items-start gap-4">
                    <FormLabel>Món ăn</FormLabel>
                    <div className="col-span-2 flex items-center space-x-4">
                      <Avatar className="aspect-square size-[50px] rounded-md object-cover">
                        <AvatarImage src={selectedDish?.image} />
                        <AvatarFallback className="rounded-none">{selectedDish?.name}</AvatarFallback>
                      </Avatar>
                      <div>{selectedDish?.name}</div>
                    </div>

                    <DishesDialog
                      onChoose={(dish) => {
                        field.onChange(dish.id)
                        setSelectedDish(dish)
                      }}
                    />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                      <Label htmlFor="quantity">Số lượng</Label>
                      <div className="col-span-3 w-full space-y-2">
                        <Input
                          id="quantity"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          className="w-16 text-center"
                          {...field}
                          value={field.value}
                          onChange={(e) => {
                            const value = e.target.value
                            const numberValue = Number(value)
                            if (isNaN(numberValue)) {
                              return
                            }
                            field.onChange(numberValue)
                          }}
                        />
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
                      <FormLabel>Trạng thái</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl className="col-span-3">
                          <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="Trạng thái" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {OrderStatusValues.map((status) => (
                            <SelectItem key={status} value={status}>
                              {getVietnameseOrderStatus(status)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
            </div>
          </form>
        </Form>
        <DialogFooter>
          <Button type="submit" form="edit-order-form">
            Lưu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
