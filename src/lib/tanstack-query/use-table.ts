import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import tableApi from '@/api-requests/table.api'
import { QueryKey } from '@/constants/query-key'
import { TableParamsType, TableResType, UpdateTableBodyType } from '@/lib/schema/table.schema'

export function useGetTablesQuery() {
  return useQuery({
    queryFn: tableApi.getTablesFromBrowserToBackend,
    queryKey: [QueryKey.getTables],
  })
}

export function useGetTableQuery(id?: TableParamsType['number'], onSuccess?: (data: TableResType) => void) {
  return useQuery({
    queryFn: () =>
      tableApi.getTableFromBrowserToBackend(id!).then((response) => {
        onSuccess && onSuccess(response.payload)
        return response
      }),
    queryKey: [QueryKey.getTable, id],
    enabled: !!id,
  })
}

export function useAddTableMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: tableApi.addTableFromBrowserToBackend,
    mutationKey: [QueryKey.addTable],
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QueryKey.getTables],
      })
    },
  })
}

export function useUpdateTableMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ number, ...body }: UpdateTableBodyType & { number: TableParamsType['number'] }) =>
      tableApi.updateTableFromBrowserToBackend(number, body),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QueryKey.getTables],
      })
    },
  })
}

export function useDeleteTableMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: tableApi.deleteTableFromBrowserToBackend,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QueryKey.getTables],
      })
    },
  })
}
