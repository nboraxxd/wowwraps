import http from '@/utils/http'
import envConfig from '@/constants/config'
import { MessageResType } from '@/lib/schemaValidations/common.schema'
import {
  LoginBodyType,
  LoginResType,
  LogoutBodyType,
  RefreshTokenBodyType,
  RefreshTokenResType,
} from '@/lib/schemaValidations/auth.schema'

const authApi = {
  refreshTokenFromBrowserToServerRequest: null as Promise<{ status: number; payload: RefreshTokenResType }> | null,

  // API OF BACKEND SERVER
  loginFromBrowserToBackend: (body: LoginBodyType) => http.post<LoginResType>('/auth/login', body),

  // logoutFromServerToBackend sẽ được gọi từ Next.js server nên
  // sẽ cần tự lấy accessToken từ cookie để tự thêm vào header
  logoutFromServerToBackend: ({ accessToken, refreshToken }: LogoutBodyType & { accessToken: string }) =>
    http.post<MessageResType>(
      '/auth/logout',
      { refreshToken },
      { headers: { Authorization: `Bearer ${accessToken}` } }
    ),

  // refreshTokenFromServerToBackend sẽ được gọi từ Next.js server nên
  // sẽ cần tự lấy refreshToken từ cookie để thêm vào body
  refreshTokenFromServerToBackend: (body: RefreshTokenBodyType) =>
    http.post<RefreshTokenResType>('/auth/refresh-token', body),

  // API OF NEXT.JS SERVER
  loginFromBrowserToServer: (body: LoginBodyType) =>
    http.post<LoginResType>('/api/auth/login', body, { baseUrl: envConfig.NEXT_PUBLIC_URL }),

  // logoutFromBrowserToServer sẽ gọi từ Next.js client đến Next.js server
  // nên không cần truyền accessToken và refreshToken vì Next.js server sẽ tự lấy từ cookie
  logoutFromBrowserToServer: () =>
    http.post<MessageResType>('/api/auth/logout', {}, { baseUrl: envConfig.NEXT_PUBLIC_URL }),

  async refreshTokenFromBrowserToServer() {
    if (this.refreshTokenFromBrowserToServerRequest) return this.refreshTokenFromBrowserToServerRequest

    this.refreshTokenFromBrowserToServerRequest = http.post<RefreshTokenResType>(
      '/api/auth/refresh-token',
      {},
      { baseUrl: envConfig.NEXT_PUBLIC_URL }
    )

    const response = await this.refreshTokenFromBrowserToServerRequest

    this.refreshTokenFromBrowserToServerRequest = null
    return response
  },
}

export default authApi
