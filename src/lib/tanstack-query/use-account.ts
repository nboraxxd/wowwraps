import { useMutation, useQuery } from '@tanstack/react-query'

import accountApi from '@/api-requests/account.api'
import { QueryKey } from '@/constants/query-key'
import { AccountResType } from '@/lib/schemaValidations/account.schema'

type GetMeQueryOptions = {
  onSuccess?: (data: AccountResType) => void
  enabled: boolean
}

export function useGetMe({ onSuccess, enabled = true }: GetMeQueryOptions) {
  return useQuery({
    queryFn: () =>
      accountApi.bGetMe().then((res) => {
        onSuccess && onSuccess(res.payload)
        return res
      }),
    queryKey: [QueryKey.bGetMe],
    enabled,
  })
}

export function useUpdateMe() {
  return useMutation({
    mutationFn: accountApi.bUpadateMe,
    mutationKey: [QueryKey.bUpdateMe],
  })
}

export function useChangePassword() {
  return useMutation({
    mutationFn: accountApi.bChangePassword,
    mutationKey: [QueryKey.bChangePassword],
  })
}
