import Image from 'next/image'
import { Fragment } from 'react'

import {
  OrderStatusIcon,
  formatCurrency,
  formatDateTimeToLocaleString,
  formatDateTimeToTimeString,
  getVietnameseOrderStatus,
} from '@/utils'
import { handleErrorApi } from '@/utils/error'
import { OrderStatus } from '@/constants/type'
import { usePayGuestOrdersMutation } from '@/lib/tanstack-query/use-order'
import { GetOrdersResType, PayGuestOrdersResType } from '@/lib/schema/order.schema'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

type Guest = GetOrdersResType['data'][0]['guest']
type Orders = GetOrdersResType['data']
interface Props {
  guest: Guest
  orders: Orders
  onPaySuccess?: (data: PayGuestOrdersResType) => void
}

export default function OrderGuestDetail({ guest, orders, onPaySuccess }: Props) {
  const ordersFilterToPurchase = guest
    ? orders.filter((order) => order.status !== OrderStatus.Paid && order.status !== OrderStatus.Rejected)
    : []

  const purchasedOrderFilter = guest ? orders.filter((order) => order.status === OrderStatus.Paid) : []

  const payGuestOrdersMutation = usePayGuestOrdersMutation()

  const handlePayAll = async () => {
    if (payGuestOrdersMutation.isPending || !guest) return

    try {
      const response = await payGuestOrdersMutation.mutateAsync({ guestId: guest.id })
      onPaySuccess && onPaySuccess(response.payload)
    } catch (error) {
      handleErrorApi({ error })
    }
  }

  return (
    <div className="space-y-2 text-sm">
      {guest && (
        <Fragment>
          <div className="space-x-1">
            <span className="font-semibold">Tên:</span>
            <span>{guest.name}</span>
            <span className="font-semibold">(#{guest.id})</span>
            <span>|</span>
            <span className="font-semibold">Bàn:</span>
            <span>{guest.tableNumber}</span>
          </div>
          <div className="space-x-1">
            <span className="font-semibold">Ngày đăng ký:</span>
            <span>{formatDateTimeToLocaleString(guest.createdAt)}</span>
          </div>
        </Fragment>
      )}

      <div className="space-y-1">
        <div className="font-semibold">Đơn hàng:</div>
        {orders.map((order, index) => {
          return (
            <div key={order.id} className="flex items-center gap-2 text-xs">
              <span className="w-[10px]">{index + 1}</span>
              <span title={getVietnameseOrderStatus(order.status)}>
                {order.status === OrderStatus.Pending && <OrderStatusIcon.Pending className="size-4" />}
                {order.status === OrderStatus.Processing && <OrderStatusIcon.Processing className="size-4" />}
                {order.status === OrderStatus.Rejected && <OrderStatusIcon.Rejected className="size-4 text-red-400" />}
                {order.status === OrderStatus.Delivered && <OrderStatusIcon.Delivered className="size-4" />}
                {order.status === OrderStatus.Paid && <OrderStatusIcon.Paid className="size-4 text-yellow-400" />}
              </span>
              <Image
                src={order.dishSnapshot.image}
                alt={order.dishSnapshot.name}
                title={order.dishSnapshot.name}
                width={30}
                height={30}
                className="size-[30px] rounded object-cover"
              />
              <span className="w-[70px] truncate sm:w-[100px]" title={order.dishSnapshot.name}>
                {order.dishSnapshot.name}
              </span>
              <span className="font-semibold" title={`Tổng: ${order.quantity}`}>
                x{order.quantity}
              </span>
              <span className="italic">{formatCurrency(order.quantity * order.dishSnapshot.price)}</span>
              <span
                className="hidden sm:inline"
                title={`Tạo: ${formatDateTimeToLocaleString(
                  order.createdAt
                )} | Cập nhật: ${formatDateTimeToLocaleString(order.updatedAt)}
          `}
              >
                {formatDateTimeToLocaleString(order.createdAt)}
              </span>
              <span
                className="sm:hidden"
                title={`Tạo: ${formatDateTimeToLocaleString(
                  order.createdAt
                )} | Cập nhật: ${formatDateTimeToLocaleString(order.updatedAt)}
          `}
              >
                {formatDateTimeToTimeString(order.createdAt)}
              </span>
            </div>
          )
        })}
      </div>

      <div className="space-x-1">
        <span className="font-semibold">Chưa thanh toán:</span>
        <Badge>
          <span>
            {formatCurrency(
              ordersFilterToPurchase.reduce((acc, order) => {
                return acc + order.quantity * order.dishSnapshot.price
              }, 0)
            )}
          </span>
        </Badge>
      </div>
      <div className="space-x-1">
        <span className="font-semibold">Đã thanh toán:</span>
        <Badge variant={'outline'}>
          <span>
            {formatCurrency(
              purchasedOrderFilter.reduce((acc, order) => {
                return acc + order.quantity * order.dishSnapshot.price
              }, 0)
            )}
          </span>
        </Badge>
      </div>

      <div>
        <Button
          className="w-full"
          size={'sm'}
          variant={'secondary'}
          disabled={ordersFilterToPurchase.length === 0 || payGuestOrdersMutation.isPending || !guest}
          onClick={handlePayAll}
        >
          Thanh toán tất cả ({ordersFilterToPurchase.length} đơn)
        </Button>
      </div>
    </div>
  )
}
