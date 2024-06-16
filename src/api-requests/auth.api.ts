import http from '@/utils/http'
import envConfig from '@/constants/config'
import { MessageResType } from '@/lib/schemaValidations/common.schema'
import { LoginBodyType, LoginResType, LogoutBodyType } from '@/lib/schemaValidations/auth.schema'

const authApi = {
  // API OF BACKEND SERVER
  loginFromBrowserToBackend: (body: LoginBodyType) => http.post<LoginResType>('/auth/login', body),

  // bLogout sẽ được gọi từ Next.js server nên cần tự thêm accessToken vào headers.Authorization
  logoutFromServerToBackend: ({ accessToken, refreshToken }: LogoutBodyType & { accessToken: string }) =>
    http.post<MessageResType>(
      '/auth/logout',
      { refreshToken },
      { headers: { Authorization: `Bearer ${accessToken}` } }
    ),

  // API OF NEXT.JS SERVER
  loginFromBrowserToServer: (body: LoginBodyType) =>
    http.post<LoginResType>('/api/auth/login', body, { baseUrl: envConfig.NEXT_PUBLIC_URL }),

  // nLogout sẽ được gọi từ Next.js client nên không cần truyền accessToken và refreshToken
  // vì nó sẽ tự động gởi thông qua cookie
  logoutFromBrowserToServer: () =>
    http.post<MessageResType>('/api/auth/logout', {}, { baseUrl: envConfig.NEXT_PUBLIC_URL }),
}

export default authApi
