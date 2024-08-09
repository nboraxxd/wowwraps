'use client'

import Image from 'next/image'
import { toast } from 'sonner'
import { useEffect, useMemo } from 'react'

import socket from '@/lib/socket'
import { UpdateOrderResType } from '@/lib/schema/order.schema'
import { useGuestGetOrdersQuery } from '@/lib/tanstack-query/use-guest'
import { formatCurrency, getVietnameseOrderStatus } from '@/utils'
import { Badge } from '@/components/ui/badge'

export default function OrdersCart() {
  const { data, isSuccess, refetch } = useGuestGetOrdersQuery()

  const orders = useMemo(() => (isSuccess ? data.payload.data : []), [data?.payload.data, isSuccess])

  const totalPrice = useMemo(() => {
    return orders.reduce((acc, order) => {
      return acc + order.quantity * order.dishSnapshot.price
    }, 0)
  }, [orders])

  useEffect(() => {
    if (socket.connected) {
      onConnect()
    }

    function onConnect() {
      console.log('connected', socket.id)
    }

    function onDisconnect() {
      console.log('disconnected')
    }

    function onOrderCreated(data: UpdateOrderResType['data']) {
      refetch()
      toast.success(
        `Món ăn ${data.dishSnapshot.name} vừa được cập nhật trạng thái sang ${getVietnameseOrderStatus(data.status).toLocaleLowerCase()}`,
        { id: data.id }
      )
    }

    socket.on('update-order', onOrderCreated)

    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)

    return () => {
      socket.off('connect', onConnect)
      socket.off('disconnect', onDisconnect)
    }
  }, [refetch])

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
