'use client'

import DOMPurify from 'dompurify'
import { createContext, useContext, useEffect, useState } from 'react'
import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import {
  ColumnDef,
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

import { handleErrorApi } from '@/utils/error'
import { formatCurrency, getVietnameseDishStatus } from '@/utils'
import { useDeleteDishMutation, useGetDishesQuery } from '@/lib/tanstack-query/use-dish'
import { DishListResType } from '@/lib/schemaValidations/dish.schema'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { AutoPagination } from '@/components/common'
import EditDish from '@/app/manage/dishes/edit-dish'
import AddDish from '@/app/manage/dishes/add-dish'

type DishItem = DishListResType['data'][0]

const DishTableContext = createContext<{
  setDishIdEdit: (value: number) => void
  dishIdEdit: number | undefined
  dishDelete: DishItem | null
  setDishDelete: (value: DishItem | null) => void
}>({
  setDishIdEdit: (_value: number | undefined) => {},
  dishIdEdit: undefined,
  dishDelete: null,
  setDishDelete: (_value: DishItem | null) => {},
})

export const columns: ColumnDef<DishItem>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
  },
  {
    accessorKey: 'image',
    header: 'Ảnh',
    cell: ({ row }) => (
      <div>
        <Avatar className="aspect-square size-[100px] rounded-md object-cover">
          <AvatarImage src={row.getValue('image')} />
          <AvatarFallback className="rounded-none">{row.original.name}</AvatarFallback>
        </Avatar>
      </div>
    ),
  },
  {
    accessorKey: 'name',
    header: 'Tên',
    cell: ({ row }) => <div className="capitalize">{row.getValue('name')}</div>,
  },
  {
    accessorKey: 'price',
    header: 'Giá cả',
    cell: ({ row }) => <div className="capitalize">{formatCurrency(row.getValue('price'))}</div>,
  },
  {
    accessorKey: 'description',
    header: 'Mô tả',
    cell: ({ row }) => (
      <div
        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(row.getValue('description')) }}
        className="whitespace-pre-line"
      />
    ),
  },
  {
    accessorKey: 'status',
    header: 'Trạng thái',
    cell: ({ row }) => <div>{getVietnameseDishStatus(row.getValue('status'))}</div>,
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: function Actions({ row }) {
      const { setDishIdEdit, setDishDelete } = useContext(DishTableContext)
      const openEditDish = () => {
        setDishIdEdit(row.original.id)
      }

      const openDeleteDish = () => {
        setDishDelete(row.original)
      }
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="size-8 p-0">
              <span className="sr-only">Open menu</span>
              <DotsHorizontalIcon className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={openEditDish}>Sửa</DropdownMenuItem>
            <DropdownMenuItem onClick={openDeleteDish}>Xóa</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

function AlertDialogDeleteDish({
  dishDelete,
  setDishDelete,
}: {
  dishDelete: DishItem | null
  setDishDelete: (value: DishItem | null) => void
}) {
  const deleteDishMutation = useDeleteDishMutation()

  async function onDeleteDish() {
    if (!dishDelete || deleteDishMutation.isPending) return

    try {
      const response = await deleteDishMutation.mutateAsync(dishDelete.id)

      toast.success(response.payload.message)

      setDishDelete(null)
    } catch (error) {
      handleErrorApi({ error })
    }
  }

  return (
    <AlertDialog
      open={!!dishDelete}
      onOpenChange={(open) => {
        if (!open) {
          setDishDelete(null)
        }
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xóa món ăn?</AlertDialogTitle>
          <AlertDialogDescription>
            Món <span className="rounded bg-foreground px-1 text-primary-foreground">{dishDelete?.name}</span> sẽ bị xóa
            vĩnh viễn
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteDishMutation.isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onDeleteDish} disabled={deleteDishMutation.isPending}>
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

// Số lượng item trên 1 trang
const PAGE_SIZE = 10

export default function DishTable() {
  const searchParam = useSearchParams()

  const page = searchParam.get('page') ? Number(searchParam.get('page')) : 1
  const pageIndex = page - 1

  const [dishIdEdit, setDishIdEdit] = useState<number | undefined>()
  const [dishDelete, setDishDelete] = useState<DishItem | null>(null)
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [pagination, setPagination] = useState({
    pageIndex, // Gía trị mặc định ban đầu, không có ý nghĩa khi data được fetch bất đồng bộ
    pageSize: PAGE_SIZE, // default page size
  })

  const getDishesQuery = useGetDishesQuery()

  const data = getDishesQuery.isSuccess ? getDishesQuery.data.payload.data : []

  const table = useReactTable({
    data,
    columns,
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

  return (
    <DishTableContext.Provider value={{ dishIdEdit, setDishIdEdit, dishDelete, setDishDelete }}>
      <div className="w-full">
        <EditDish id={dishIdEdit} setId={setDishIdEdit} />
        <AlertDialogDeleteDish dishDelete={dishDelete} setDishDelete={setDishDelete} />
        <div className="flex items-center py-4">
          <Input
            placeholder="Lọc món ăn"
            value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
            onChange={(event) => table.getColumn('name')?.setFilterValue(event.target.value)}
            className="max-w-sm"
          />
          <div className="ml-auto flex items-center gap-2">
            <AddDish />
          </div>
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
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
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-end space-x-2 py-4">
          <div className="flex-1 py-4 text-xs text-muted-foreground ">
            Hiển thị <strong>{table.getPaginationRowModel().rows.length}</strong> trong <strong>{data.length}</strong>{' '}
            kết quả
          </div>
          <div>
            <AutoPagination
              page={table.getState().pagination.pageIndex + 1}
              pageSize={table.getPageCount()}
              pathname="/manage/dishes"
            />
          </div>
        </div>
      </div>
    </DishTableContext.Provider>
  )
}
