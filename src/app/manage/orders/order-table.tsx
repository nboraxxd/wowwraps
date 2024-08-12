'use client'

import { toast } from 'sonner'
import { useSearchParams } from 'next/navigation'
import { Check, ChevronsUpDown } from 'lucide-react'
import { endOfDay, format, startOfDay } from 'date-fns'
import { createContext, useEffect, useState } from 'react'
import {
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'

import { OrderStatusValues } from '@/constants/type'
import { getVietnameseOrderStatus, cn } from '@/utils'
import socket from '@/lib/socket'
import { useGetOrdersQuery, useUpdateOrderMutation } from '@/lib/tanstack-query/use-order'
import { useGetTablesQuery } from '@/lib/tanstack-query/use-table'
import { GuestCreateOrdersResType } from '@/lib/schema/guest.schema'
import { GetOrdersResType, PayGuestOrdersResType, UpdateOrderResType } from '@/lib/schema/order.schema'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandGroup, CommandItem, CommandList } from '@/components/ui/command'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import AddOrder from '@/app/manage/orders/add-order'
import EditOrder from '@/app/manage/orders/edit-order'
import OrderStatics from '@/app/manage/orders/order-statics'
import orderTableColumns from '@/app/manage/orders/order-table-columns'
import { useOrderService } from '@/app/manage/orders/order.service'
import TableSkeleton from '@/app/manage/orders/table-skeleton'
import { AutoPagination } from '@/components/common'
import { handleErrorApi } from '@/utils/error'

export type StatusCountObject = Record<(typeof OrderStatusValues)[number], number>
export type Statics = {
  status: StatusCountObject
  table: Record<number, Record<number, StatusCountObject>>
}
export type OrderObjectByGuestID = Record<number, GetOrdersResType['data']>
export type ServingGuestByTableNumber = Record<number, OrderObjectByGuestID>

export const OrderTableContext = createContext({
  setOrderIdEdit: (_value: number | undefined) => {},
  orderIdEdit: undefined as number | undefined,
  changeStatus: (_payload: {
    orderId: number
    dishId: number
    status: (typeof OrderStatusValues)[number]
    quantity: number
  }) => {},
  orderObjectByGuestId: {} as OrderObjectByGuestID,
})

const PAGE_SIZE = 10
const initFromDate = startOfDay(new Date())
const initToDate = endOfDay(new Date())

export default function OrderTable() {
  const searchParams = useSearchParams()
  const page = searchParams.get('page') ? Number(searchParams.get('page')) : 1
  const pageIndex = page - 1

  const [toDate, setToDate] = useState(initToDate)
  const [fromDate, setFromDate] = useState(initFromDate)
  const [openStatusFilter, setOpenStatusFilter] = useState(false)
  const [orderIdEdit, setOrderIdEdit] = useState<number | undefined>()
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [pagination, setPagination] = useState({
    pageIndex, // Giá trị mặc định ban đầu, không có ý nghĩa khi data được fetch bất đồng bộ
    pageSize: PAGE_SIZE, // default page size
  })

  const {
    isLoading: isLoadingGetOrders,
    isSuccess: isSuccessGetOrders,
    data: dataGetOrders,
    refetch: refetchGetOrders,
  } = useGetOrdersQuery({ fromDate, toDate })
  const tablesQuery = useGetTablesQuery()
  const updateOrderMutation = useUpdateOrderMutation()

  const orderList = isSuccessGetOrders ? dataGetOrders.payload.data : []
  const tableList = tablesQuery.data?.payload.data ?? []
  const tableListSortedByNumber = tableList.sort((a, b) => a.number - b.number)

  const { statics, orderObjectByGuestId, servingGuestByTableNumber } = useOrderService(orderList)

  const changeStatus = async (body: {
    orderId: number
    dishId: number
    status: (typeof OrderStatusValues)[number]
    quantity: number
  }) => {
    try {
      await updateOrderMutation.mutateAsync(body)
    } catch (error) {
      handleErrorApi({ error })
    }
  }

  const table = useReactTable({
    data: orderList,
    columns: orderTableColumns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    autoResetPageIndex: false,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
    },
  })

  useEffect(() => {
    table.setPagination({
      pageIndex,
      pageSize: PAGE_SIZE,
    })
  }, [table, pageIndex])

  const resetDateFilter = () => {
    setFromDate(initFromDate)
    setToDate(initToDate)
  }

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

    function refetch() {
      const now = new Date()
      if (now >= fromDate && now <= toDate) {
        refetchGetOrders()
      }
    }

    function onUpdateOrder(data: UpdateOrderResType['data']) {
      refetch()
      toast.success(
        `Món ăn ${data.dishSnapshot.name} vừa được cập nhật trạng thái sang ${getVietnameseOrderStatus(data.status).toLocaleLowerCase()}`
      )
    }

    function onCreateOrder(data: GuestCreateOrdersResType['data']) {
      const { guest } = data[0]

      refetch()
      toast.success(`${guest?.name} tại bàn ${guest?.tableNumber} vừa đặt ${data.length} đơn`)
    }

    function onPayment(data: PayGuestOrdersResType['data']) {
      const { guest } = data[0]

      refetch()
      toast.success(`${guest?.name} tại bàn ${guest?.tableNumber} vừa thanh toán ${data.length} đơn`)
    }

    socket.on('update-order', onUpdateOrder)
    socket.on('new-order', onCreateOrder)
    socket.on('payment', onPayment)

    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)

    return () => {
      socket.off('connect', onConnect)
      socket.off('disconnect', onDisconnect)
      socket.off('update-order', onUpdateOrder)
      socket.off('new-order', onCreateOrder)
      socket.off('payment', onPayment)
    }
  }, [fromDate, refetchGetOrders, toDate])

  return (
    <OrderTableContext.Provider
      value={{
        orderIdEdit,
        setOrderIdEdit,
        changeStatus,
        orderObjectByGuestId,
      }}
    >
      <div className="w-full">
        <EditOrder id={orderIdEdit} setId={setOrderIdEdit} onSubmitSuccess={() => {}} />
        <div className=" flex items-center">
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center">
              <span className="mr-2">Từ</span>
              <Input
                type="datetime-local"
                placeholder="Từ ngày"
                className="text-sm"
                value={format(fromDate, 'yyyy-MM-dd HH:mm').replace(' ', 'T')}
                onChange={(event) => setFromDate(new Date(event.target.value))}
              />
            </div>
            <div className="flex items-center">
              <span className="mr-2">Đến</span>
              <Input
                type="datetime-local"
                placeholder="Đến ngày"
                value={format(toDate, 'yyyy-MM-dd HH:mm').replace(' ', 'T')}
                onChange={(event) => setToDate(new Date(event.target.value))}
              />
            </div>
            <Button className="" variant={'outline'} onClick={resetDateFilter}>
              Reset
            </Button>
          </div>
          <div className="ml-auto">
            <AddOrder />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-4 py-4">
          <Input
            placeholder="Tên khách"
            value={(table.getColumn('guestName')?.getFilterValue() as string) ?? ''}
            onChange={(event) => table.getColumn('guestName')?.setFilterValue(event.target.value)}
            className="max-w-[100px]"
          />
          <Input
            placeholder="Số bàn"
            value={(table.getColumn('tableNumber')?.getFilterValue() as string) ?? ''}
            onChange={(event) => table.getColumn('tableNumber')?.setFilterValue(event.target.value)}
            className="max-w-[80px]"
          />
          <Popover open={openStatusFilter} onOpenChange={setOpenStatusFilter}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={openStatusFilter}
                className="w-[150px] justify-between text-sm"
              >
                {table.getColumn('status')?.getFilterValue()
                  ? getVietnameseOrderStatus(
                      table.getColumn('status')?.getFilterValue() as (typeof OrderStatusValues)[number]
                    )
                  : 'Trạng thái'}
                <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
              <Command>
                <CommandGroup>
                  <CommandList>
                    {OrderStatusValues.map((status) => (
                      <CommandItem
                        key={status}
                        value={status}
                        onSelect={(currentValue) => {
                          table
                            .getColumn('status')
                            ?.setFilterValue(
                              currentValue === table.getColumn('status')?.getFilterValue() ? '' : currentValue
                            )
                          setOpenStatusFilter(false)
                        }}
                      >
                        <Check
                          className={cn(
                            'mr-2 size-4',
                            table.getColumn('status')?.getFilterValue() === status ? 'opacity-100' : 'opacity-0'
                          )}
                        />
                        {getVietnameseOrderStatus(status)}
                      </CommandItem>
                    ))}
                  </CommandList>
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
        <OrderStatics
          statics={statics}
          tableList={tableListSortedByNumber}
          servingGuestByTableNumber={servingGuestByTableNumber}
        />
        {isLoadingGetOrders ? <TableSkeleton /> : null}
        {isSuccessGetOrders ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())}
                        </TableHead>
                      )
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={orderTableColumns.length} className="h-24 text-center">
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        ) : null}
        <div className="flex items-center justify-end space-x-2 py-4">
          <div className="flex-1 py-4 text-xs text-muted-foreground ">
            Hiển thị <strong>{table.getPaginationRowModel().rows.length}</strong> trong{' '}
            <strong>{orderList.length}</strong> kết quả
          </div>
          <div>
            <AutoPagination
              page={table.getState().pagination.pageIndex + 1}
              pageSize={table.getPageCount()}
              pathname="/manage/orders"
            />
          </div>
        </div>
      </div>
    </OrderTableContext.Provider>
  )
}
