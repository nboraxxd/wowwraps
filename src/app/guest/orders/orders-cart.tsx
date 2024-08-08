'use client'

import Image from 'next/image'
import { useMemo } from 'react'

import { useGuestGetOrdersQuery } from '@/lib/tanstack-query/use-guest'
import { formatCurrency, getVietnameseOrderStatus } from '@/utils'
import { Badge } from '@/components/ui/badge'

export default function OrdersCart() {
  const { data, isSuccess } = useGuestGetOrdersQuery()

  const orders = useMemo(() => (isSuccess ? data.payload.data : []), [data?.payload.data, isSuccess])

  const totalPrice = useMemo(() => {
    return orders.reduce((acc, order) => {
      return acc + order.quantity * order.dishSnapshot.price
    }, 0)
  }, [orders])

  return (
    <>
      {orders.map((order, index) => (
        <div key={order.id} className="flex gap-4">
          <span>{index + 1}</span>
          <div className="shrink-0">
            <Image
              src={order.dishSnapshot.image}
              alt={order.dishSnapshot.name}
              priority
              height={100}
              width={100}
              quality={100}
              className="size-[80px] rounded-md object-cover"
            />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm">{order.dishSnapshot.name}</h3>
            <p className="text-xs font-semibold">
              {order.quantity} x {formatCurrency(order.dishSnapshot.price)}
            </p>
            <p className="text-xs"> = {formatCurrency(order.quantity * order.dishSnapshot.price)}</p>
          </div>
          <div className="ml-auto flex shrink-0 items-center justify-center">
            <Badge variant="outline">{getVietnameseOrderStatus(order.status)}</Badge>
          </div>
        </div>
      ))}
      <div className="sticky bottom-0 min-w-[331px] bg-background">
        <div className="flex justify-between border-t p-4">
          <div>
            Tổng đơn <span className="text-sm">({orders.reduce((acc, order) => acc + order.quantity, 0)} món)</span>
          </div>

          <span className="text-sm font-semibold">{formatCurrency(totalPrice)}</span>
        </div>
      </div>
    </>
  )
}
