import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import tableApi from '@/api-requests/table.api'
import { QueryKey } from '@/constants/query-key'
import { TableParamsType, UpdateTableBodyType } from '@/lib/schemaValidations/table.schema'

export function useGetTablesQuery() {
  return useQuery({
    queryFn: tableApi.getTablesFromBrowserToBackend,
    queryKey: [QueryKey.getTables],
  })
}

export function useGetTableQuery(id: TableParamsType['number']) {
  return useQuery({
    queryFn: () => tableApi.getTableFromBrowserToBackend(id),
    queryKey: [QueryKey.getTable, id],
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

export function useUpdateTableFromBrowserToBackend() {
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

export function useDeleteTableFromBrowserToBackend() {
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
