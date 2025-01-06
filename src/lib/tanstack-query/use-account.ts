import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import accountApi from '@/api-requests/account.api'
import { QueryKey } from '@/constants/query-key'
import {
  AccountIdParamType,
  AccountResType,
  GetGuestListQueryParamsType,
  UpdateEmployeeAccountBodyType,
} from '@/lib/schema/account.schema'

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
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: accountApi.upadateMeFromBrowserToBackend,
    mutationKey: [QueryKey.updateMe],
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QueryKey.getMe],
      })
    },
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

export function useGetEmployeeQuery(id?: AccountIdParamType['id'], onSuccess?: (data: AccountResType) => void) {
  return useQuery({
    queryFn: () =>
      accountApi.getEmployeeFromBrowserToBackend(id!).then((res) => {
        onSuccess && onSuccess(res.payload)
        return res
      }),
    queryKey: [QueryKey.getEmployee, id],
    enabled: Boolean(id),
  })
}

export function useUpdateEmployeeMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, ...body }: UpdateEmployeeAccountBodyType & { id: AccountIdParamType['id'] }) =>
      accountApi.updateEmployeeFromBrowserToBackend(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QueryKey.getEmployees],
        exact: true,
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

export function useGetGuestsQuery(queryParams: GetGuestListQueryParamsType) {
  return useQuery({
    queryFn: () => accountApi.getGuestsFromBrowserToBackend(queryParams),
    queryKey: [QueryKey.getGuests, queryParams],
  })
}

export function useCreateGuestMutation() {
  return useMutation({
    mutationFn: accountApi.createGuestFromBrowserToBackend,
  })
}
