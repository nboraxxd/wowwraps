import { Users } from 'lucide-react'
import { Fragment, useState } from 'react'

import { OrderStatus, OrderStatusValues } from '@/constants/type'
import { OrderStatusIcon, cn, getVietnameseOrderStatus } from '@/utils'
import { TableListResType } from '@/lib/schema/table.schema'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import OrderGuestDetail from '@/app/manage/orders/order-guest-detail'
import { ServingGuestByTableNumber, Statics, StatusCountObject } from '@/app/manage/orders/order-table'

interface Props {
  statics: Statics
  tableList: TableListResType['data']
  servingGuestByTableNumber: ServingGuestByTableNumber
}

export default function OrderStatics({ statics, tableList, servingGuestByTableNumber }: Props) {
  const [selectedTableNumber, setSelectedTableNumber] = useState<number>(0)
  const selectedServingGuest = servingGuestByTableNumber[selectedTableNumber]

  return (
    <Fragment>
      <Dialog
        open={Boolean(selectedTableNumber)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedTableNumber(0)
          }
        }}
      >
        <DialogContent className="max-h-full overflow-auto">
          {selectedServingGuest && (
            <DialogHeader>
              <DialogTitle>Khách đang ngồi tại bàn {selectedTableNumber}</DialogTitle>
            </DialogHeader>
          )}
          <div>
            {selectedServingGuest &&
              Object.keys(selectedServingGuest).map((guestId, index) => {
                const orders = selectedServingGuest[Number(guestId)]

                return (
                  <div key={guestId}>
                    <OrderGuestDetail
                      guest={orders[0].guest}
                      orders={orders}
                      onPaySuccess={() => setSelectedTableNumber(0)}
                    />
                    {index !== Object.keys(selectedServingGuest).length - 1 && <Separator className="my-5" />}
                  </div>
                )
              })}
          </div>
        </DialogContent>
      </Dialog>
      <div className="flex flex-wrap items-stretch justify-start gap-4 py-4">
        {tableList.map((table) => {
          const tableNumber: number = table.number
          const tableStatics: Record<number, StatusCountObject> | undefined = statics.table[tableNumber]
          let isEmptyTable = true
          let countObject: StatusCountObject = {
            Pending: 0,
            Processing: 0,
            Delivered: 0,
            Paid: 0,
            Rejected: 0,
          }
          const servingGuestCount = Object.values(servingGuestByTableNumber[tableNumber] ?? []).length
          if (tableStatics) {
            for (const guestId in tableStatics) {
              const guestStatics = tableStatics[Number(guestId)]
              if (
                [guestStatics.Pending, guestStatics.Processing, guestStatics.Delivered].some(
                  (status) => status !== 0 && status !== undefined
                )
              ) {
                isEmptyTable = false
              }
              countObject = {
                Pending: countObject.Pending + (guestStatics.Pending ?? 0),
                Processing: countObject.Processing + (guestStatics.Processing ?? 0),
                Delivered: countObject.Delivered + (guestStatics.Delivered ?? 0),
                Paid: countObject.Paid + (guestStatics.Paid ?? 0),
                Rejected: countObject.Rejected + (guestStatics.Rejected ?? 0),
              }
            }
          }
          return (
            <div
              key={tableNumber}
              className={cn('flex items-stretch gap-2 rounded-md border p-2 text-sm', {
                'bg-secondary': !isEmptyTable,
                'border-transparent': !isEmptyTable,
              })}
              onClick={() => {
                if (!isEmptyTable) setSelectedTableNumber(tableNumber)
              }}
            >
              <div className="flex flex-col items-center justify-center gap-2">
                <div className="text-center text-lg font-semibold">{tableNumber}</div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <div className="flex items-center gap-2">
                        <Users className="size-4" />
                        <span>{servingGuestCount}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>Đang phục vụ: {servingGuestCount} khách</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Separator
                orientation="vertical"
                className={cn('h-auto shrink-0 grow', {
                  'bg-muted-foreground': !isEmptyTable,
                })}
              />
              {isEmptyTable && <div className="flex items-center justify-between text-sm">Ready</div>}
              {!isEmptyTable && (
                <div className="flex flex-col gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <div className="flex items-center gap-2">
                          <OrderStatusIcon.Pending className="size-4" />
                          <span>{countObject[OrderStatus.Pending] ?? 0}</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        {getVietnameseOrderStatus(OrderStatus.Pending)}: {countObject[OrderStatus.Pending] ?? 0} đơn
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger>
                        <div className="flex items-center gap-2">
                          <OrderStatusIcon.Processing className="size-4" />
                          <span>{countObject[OrderStatus.Processing] ?? 0}</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        {getVietnameseOrderStatus(OrderStatus.Processing)}: {countObject[OrderStatus.Processing] ?? 0}{' '}
                        đơn
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger>
                        <div className="flex items-center gap-2">
                          <OrderStatusIcon.Delivered className="size-4" />
                          <span>{countObject[OrderStatus.Delivered] ?? 0}</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        {getVietnameseOrderStatus(OrderStatus.Delivered)}: {countObject[OrderStatus.Delivered] ?? 0} đơn
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              )}
            </div>
          )
        })}
      </div>
      <div className="flex flex-wrap items-end justify-start gap-4 py-4">
        {OrderStatusValues.map((status) => (
          <Badge variant="secondary" key={status}>
            {getVietnameseOrderStatus(status)}: {statics.status[status] ?? 0}
          </Badge>
        ))}
      </div>
    </Fragment>
  )
}
