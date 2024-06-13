import { useMutation } from '@tanstack/react-query'

import authApi from '@/api-requests/auth.api'
import { QueryKey } from '@/constants/query-key'

export function useNLoginMutation() {
  return useMutation({ mutationFn: authApi.nLogin, mutationKey: [QueryKey.nLogin] })
}

export function useNLogoutMutation() {
  return useMutation({ mutationFn: authApi.nLogout, mutationKey: [QueryKey.nLogout] })
}
