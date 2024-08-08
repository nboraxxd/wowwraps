'use client'

import Image from 'next/image'
import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

import { DishStatus } from '@/constants/type'
import { formatCurrency } from '@/utils'
import { handleErrorApi } from '@/utils/error'
import { useGetDishesQuery } from '@/lib/tanstack-query/use-dish'
import { GuestCreateOrdersBodyType } from '@/lib/schema/guest.schema'
import { useGuestCreateOrderMutation } from '@/lib/tanstack-query/use-guest'
import { Button } from '@/components/ui/button'
import Quantity from '@/app/guest/menu/quantity'

export default function MenuOrder() {
  const [orders, setOrders] = useState<GuestCreateOrdersBodyType>([])

  const router = useRouter()
  const getDishesQuery = useGetDishesQuery()
  const { mutateAsync } = useGuestCreateOrderMutation()

  const dishesResponse = useMemo(
    () => (getDishesQuery.isSuccess ? getDishesQuery.data.payload.data : []),
    [getDishesQuery.data?.payload.data, getDishesQuery.isSuccess]
  )

  const totalPrice = useMemo(() => {
    return dishesResponse.reduce((acc, dish) => {
      const order = orders.find((order) => order.dishId === dish.id)
      if (!order) return acc

      return acc + dish.price * order.quantity
    }, 0)
  }, [dishesResponse, orders])

  function handleQuantityChange(dishId: number, quantity: number) {
    setOrders((prevOrders) => {
      if (quantity === 0) {
        return prevOrders.filter((order) => order.dishId !== dishId)
      }

      const index = prevOrders.findIndex((order) => order.dishId === dishId)
      if (index === -1) {
        return [...prevOrders, { dishId, quantity }]
      }

      const newOrders = [...prevOrders]
      newOrders[index].quantity = quantity

      return newOrders
    })
  }

  async function handleOrder() {
    if (orders.length === 0) return

    try {
      await mutateAsync(orders)
      router.push('/guest/orders')
      router.refresh()
    } catch (error) {
      handleErrorApi({ error })
    }
  }

  return (
    <>
      {dishesResponse
        .filter((dish) => dish.status !== DishStatus.Hidden)
        .map((dish) => (
          <div key={dish.id} className="flex gap-4">
            <div className="relative shrink-0">
              {dish.status === DishStatus.Unavailable ? (
                <span className="absolute inset-0 flex items-center justify-center bg-black/50 text-sm font-semibold">
                  Hết hàng
                </span>
              ) : null}
              <Image
                src={dish.image}
                alt={dish.name}
                height={100}
                width={100}
                quality={100}
                className="size-[80px] rounded-md object-cover"
              />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm">{dish.name}</h3>
              <p className="text-xs">{dish.description}</p>
              <p className="text-xs font-semibold">{formatCurrency(dish.price)}</p>
            </div>
            <div className="ml-auto flex shrink-0 items-center justify-center">
              <Quantity
                disabled={dish.status !== DishStatus.Available}
                onChange={(value) => handleQuantityChange(dish.id, value)}
                value={orders.find((order) => order.dishId === dish.id)?.quantity ?? 0}
              />
            </div>
          </div>
        ))}
      <div className="sticky bottom-0 min-w-[331px]">
        <Button className="w-full justify-between" onClick={handleOrder}>
          <span>Gọi món</span>
          <span>
            {orders.reduce((acc, order) => acc + order.quantity, 0)} món • {formatCurrency(totalPrice)}
          </span>
        </Button>
      </div>
    </>
  )
}
