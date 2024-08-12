'use client'

import Image from 'next/image'
import { toast } from 'sonner'
import { useEffect, useMemo } from 'react'

import { OrderStatus } from '@/constants/type'
import { formatCurrency, getVietnameseOrderStatus } from '@/utils'
import socket from '@/lib/socket'
import { useGuestGetOrdersQuery } from '@/lib/tanstack-query/use-guest'
import { PayGuestOrdersResType, UpdateOrderResType } from '@/lib/schema/order.schema'
import { Badge } from '@/components/ui/badge'

export default function OrdersCart() {
  const { data, isSuccess, refetch } = useGuestGetOrdersQuery()

  const orders = useMemo(() => (isSuccess ? data.payload.data : []), [data?.payload.data, isSuccess])

  const { unpaid, paid } = useMemo(() => {
    return orders.reduce(
      (acc, order) => {
        if (
          order.status === OrderStatus.Delivered ||
          order.status === OrderStatus.Pending ||
          order.status === OrderStatus.Processing
        ) {
          return {
            ...acc,
            unpaid: {
              price: acc.unpaid.price + order.quantity * order.dishSnapshot.price,
              quantity: acc.unpaid.quantity + order.quantity,
            },
          }
        } else if (order.status === OrderStatus.Paid) {
          return {
            ...acc,
            paid: {
              price: acc.paid.price + order.quantity * order.dishSnapshot.price,
              quantity: acc.paid.quantity + order.quantity,
            },
          }
        }

        return acc
      },
      {
        unpaid: {
          price: 0,
          quantity: 0,
        },
        paid: {
          price: 0,
          quantity: 0,
        },
      }
    )
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

    function onUpdateOrder(data: UpdateOrderResType['data']) {
      refetch()
      toast.success(
        `Món ăn ${data.dishSnapshot.name} vừa được cập nhật trạng thái sang ${getVietnameseOrderStatus(data.status).toLocaleLowerCase()}`
      )
    }

    function onPayment(data: PayGuestOrdersResType['data']) {
      refetch()
      toast.success(`Đã thanh toán thành công ${data.length} đơn`)
    }

    socket.on('update-order', onUpdateOrder)
    socket.on('payment', onPayment)

    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)

    return () => {
      socket.off('connect', onConnect)
      socket.off('disconnect', onDisconnect)
      socket.off('update-order', onUpdateOrder)
      socket.off('payment', onPayment)
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
        {unpaid.quantity > 0 ? (
          <div className="flex justify-between border-t p-4">
            <div>
              Chưa thanh toán <span className="text-sm">({unpaid.quantity} món)</span>
            </div>
            <span className="text-sm font-semibold">{formatCurrency(unpaid.price)}</span>
          </div>
        ) : null}
        {paid.quantity > 0 ? (
          <div className="flex justify-between border-t p-4">
            <div>
              Đã thanh toán <span className="text-sm">({paid.quantity} món)</span>
            </div>
            <span className="text-sm font-semibold">{formatCurrency(paid.price)}</span>
          </div>
        ) : null}
      </div>
    </>
  )
}
