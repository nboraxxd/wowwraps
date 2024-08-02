'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'

import { formatCurrency } from '@/utils'
import { useGetDishesQuery } from '@/lib/tanstack-query/use-dish'
import { GuestCreateOrdersBodyType } from '@/lib/schema/guest.schema'
import { Button } from '@/components/ui/button'
import Quantity from '@/app/guest/menu/quantity'

export default function MenuOrder() {
  const [orders, setOrders] = useState<GuestCreateOrdersBodyType>([])

  const getDishesQuery = useGetDishesQuery()

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

  return (
    <>
      {dishesResponse.map((dish) => (
        <div key={dish.id} className="flex gap-4">
          <div className="shrink-0">
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
              onChange={(value) => handleQuantityChange(dish.id, value)}
              value={orders.find((order) => order.dishId === dish.id)?.quantity ?? 0}
            />
          </div>
        </div>
      ))}
      <div className="sticky bottom-0 min-w-[331px]">
        <Button className="w-full justify-between">
          <span>Giỏ hàng · {orders.reduce((acc, order) => acc + order.quantity, 0)} món</span>
          <span>{formatCurrency(totalPrice)}</span>
        </Button>
      </div>
    </>
  )
}
