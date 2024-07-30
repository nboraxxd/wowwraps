import { useMutation } from '@tanstack/react-query'

import guestApi from '@/api-requests/guest.api'

// Calling the login API from the browser to the Next.js server (using Next.js server as a proxy)
export function useGuestLoginToServerMutation() {
  return useMutation({ mutationFn: guestApi.loginFromBrowserToServer })
}

// Calling the logout API from the browser to the Next.js server (using Next.js server as a proxy)
export function useGuestLogoutToServerMutation() {
  return useMutation({ mutationFn: guestApi.logoutFromBrowserToServer })
}
