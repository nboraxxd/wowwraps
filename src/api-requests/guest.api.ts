import http from '@/utils/http'
import envConfig from '@/constants/config'
import { MessageResType } from '@/lib/schema/common.schema'
import { LogoutBodyType, RefreshTokenBodyType, RefreshTokenResType } from '@/lib/schema/auth.schema'
import {
  GuestCreateOrdersBodyType,
  GuestCreateOrdersResType,
  GuestGetOrdersResType,
  GuestLoginBodyType,
  GuestLoginResType,
} from '@/lib/schema/guest.schema'

const PREFIX = '/guest'

const guestApi = {
  refreshTokenFromBrowserToServerRequest: null as Promise<{ status: number; payload: RefreshTokenResType }> | null,

  // API OF BACKEND SERVER
  loginFromServerToBackend: (body: GuestLoginBodyType) => http.post<GuestLoginResType>(`${PREFIX}/auth/login`, body),

  // logoutFromServerToBackend sẽ được gọi từ Next.js server nên
  // sẽ cần tự lấy accessToken từ cookie để tự thêm vào header
  logoutFromServerToBackend: ({ accessToken, refreshToken }: LogoutBodyType & { accessToken: string }) =>
    http.post<MessageResType>(
      `${PREFIX}/auth/logout`,
      { refreshToken },
      { headers: { Authorization: `Bearer ${accessToken}` } }
    ),

  // refreshTokenFromServerToBackend sẽ được gọi từ Next.js server nên
  // sẽ cần tự lấy refreshToken từ cookie để thêm vào body
  refreshTokenFromServerToBackend: (body: RefreshTokenBodyType) =>
    http.post<RefreshTokenResType>(`${PREFIX}/auth/refresh-token`, body),

  // API OF NEXT.JS SERVER
  loginFromBrowserToServer: (body: GuestLoginBodyType) =>
    http.post<GuestLoginResType>('/api/guest/auth/login', body, { baseUrl: envConfig.NEXT_PUBLIC_URL }),

  // logoutFromBrowserToServer sẽ gọi từ Next.js client đến Next.js server
  // nên không cần truyền accessToken và refreshToken vì Next.js server sẽ tự lấy từ cookie
  logoutFromBrowserToServer: () =>
    http.post<MessageResType>('/api/guest/auth/logout', {}, { baseUrl: envConfig.NEXT_PUBLIC_URL }),

  async refreshTokenFromBrowserToServer() {
    if (this.refreshTokenFromBrowserToServerRequest) return this.refreshTokenFromBrowserToServerRequest

    this.refreshTokenFromBrowserToServerRequest = http.post<RefreshTokenResType>(
      '/api/guest/auth/refresh-token',
      {},
      { baseUrl: envConfig.NEXT_PUBLIC_URL }
    )

    const response = await this.refreshTokenFromBrowserToServerRequest

    this.refreshTokenFromBrowserToServerRequest = null
    return response
  },

  orderFromBrowserToBackend: (body: GuestCreateOrdersBodyType) =>
    http.post<GuestCreateOrdersResType>(`${PREFIX}/orders`, body),

  getOrdersFromBrowserToBackend: () => http.get<GuestGetOrdersResType>(`${PREFIX}/orders`),
}

export default guestApi
