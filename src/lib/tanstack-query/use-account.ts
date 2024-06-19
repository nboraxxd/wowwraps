import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import accountApi from '@/api-requests/account.api'
import { QueryKey } from '@/constants/query-key'
import {
  AccountIdParamType,
  AccountResType,
  UpdateEmployeeAccountBodyType,
} from '@/lib/schemaValidations/account.schema'

type GetMeQueryOptions = {
  onSuccess?: (data: AccountResType) => void
  enabled: boolean
}

export function useGetMeQuery({ onSuccess, enabled = true }: GetMeQueryOptions) {
  return useQuery({
    queryFn: () =>
      accountApi.getMeFromBrowserToBackend().then((res) => {
        onSuccess && onSuccess(res.payload)
        return res
      }),
    queryKey: [QueryKey.getMe],
    enabled,
  })
}

export function useUpdateMeMutation() {
  return useMutation({
    mutationFn: accountApi.upadateMeFromBrowserToBackend,
    mutationKey: [QueryKey.updateMe],
  })
}

export function useChangePasswordMutation() {
  return useMutation({
    mutationFn: accountApi.changePasswordFromBrowserToBackend,
    mutationKey: [QueryKey.changePassword],
  })
}

export function useGetEmployeesQuery() {
  return useQuery({
    queryFn: accountApi.getEmployeesFromBrowserToBackend,
    queryKey: [QueryKey.getEmployees],
  })
}

export function useAddEmployeeMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: accountApi.addEmployeeFromBrowserToBackend,
    mutationKey: [QueryKey.addEmployee],
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QueryKey.getEmployees],
      })
    },
  })
}

export function useGetEmployeeQuery(id: AccountIdParamType['id']) {
  return useQuery({
    queryFn: () => accountApi.getEmployeeFromBrowserToBackend(id),
    queryKey: [QueryKey.getEmployee, id],
  })
}

export function useUpdateEmployeeMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, ...body }: UpdateEmployeeAccountBodyType & { id: AccountIdParamType['id'] }) =>
      accountApi.updateEmployeeFromBrowserToBackend(id, body),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: [QueryKey.getEmployee, id],
      })
    },
  })
}

export function useDeleteEmployeeMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: accountApi.deleteEmployeeFromBrowserToBackend,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QueryKey.getEmployees],
      })
    },
  })
}
