import { useMutation } from '@tanstack/react-query'

import authApi from '@/api-requests/auth.api'
import { QueryKey } from '@/constants/query-key'

// Calling the login API from the browser to the Next.js server (using Next.js server as a proxy)
export function useLoginToServerMutation() {
  return useMutation({ mutationFn: authApi.loginFromBrowserToServer, mutationKey: [QueryKey.login] })
}

// Calling the logout API from the browser to the Next.js server (using Next.js server as a proxy)
export function useLogoutToServerMutation() {
  return useMutation({ mutationFn: authApi.logoutFromBrowserToServer, mutationKey: [QueryKey.logout] })
}
