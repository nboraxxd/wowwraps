import jwt from 'jsonwebtoken'
import { format } from 'date-fns'
import { twMerge } from 'tailwind-merge'
import { type ClassValue, clsx } from 'clsx'
import { BookX, CookingPot, HandCoins, Loader, Truck } from 'lucide-react'

import envConfig from '@/constants/config'
import authApi from '@/api-requests/auth.api'
import guestApi from '@/api-requests/guest.api'
import { RoleType, TokenPayload } from '@/types/jwt.types'
import { DishStatus, OrderStatus, Role, TableStatus } from '@/constants/type'
import {
  getAccessTokenFromLocalStorage,
  getRefreshTokenFromLocalStorage,
  removeTokensFromLocalStorage,
  setAccessTokenToLocalStorage,
  setRefreshTokenToLocalStorage,
} from '@/utils/local-storage'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const isBrowser = typeof window !== 'undefined'

export const addFirstSlashToUrl = (url: string) => {
  return url.startsWith('/') ? url : `/${url}`
}

export async function checkAndRefreshToken(params?: { onSuccess?: (role?: RoleType) => void; onError?: () => void }) {
  // Không nên đưa logic lấy access token và refresh token ra khỏi function `checkAndRefreshToken`
  // Vì để mỗi lần mà gọi function `checkAndRefreshToken` thì sẽ lấy access token và refresh token mới
  // Để tránh hiện tượng bug nó lấy access token và refresh token cũ ở lần đầu rồi gọi cho các lần tiếp theo
  const accessToken = getAccessTokenFromLocalStorage()
  const refreshToken = getRefreshTokenFromLocalStorage()

  // Chưa đăng nhập thì không cần check refresh token
  if (!accessToken || !refreshToken) return

  const accessTokenDecoded = decodeToken(accessToken)
  const refreshTokenDecoded = decodeToken(refreshToken)

  // Thời điểm hết hạn của token được tính theo epoch time (s)
  // Còn khi dùng cú pháp `new Date().getTime()` thì nó sẽ trả về epoch time (ms)
  const now = Math.floor(new Date().getTime() / 1000)

  const shouldRefreshToken = accessTokenDecoded.exp - now < (accessTokenDecoded.exp - accessTokenDecoded.iat) / 3

  // Trường hợp BẮT BUỘC PHẢI refresh token nhưng khi đó refreshToken đã hết hạn thì không xử lý nữa
  if (shouldRefreshToken && refreshTokenDecoded.exp <= now) {
    removeTokensFromLocalStorage()
    return params?.onError && params.onError()
  }

  // Ví dụ access token có thời gian hết hạn là 30s
  // thì chúng ta sẽ refresh token khi access token còn 1/3 thời gian, tức còn 10s
  // Thời gian còn lại của access token sẽ tính theo công thức: accessTokenDecoded.exp - now
  // Thời gian hết hạn của access token sẽ tính theo công thức: accessTokenDecoded.exp - accessTokenDecoded.iat

  // Thời gian còn lại của access token nhỏ hơn 1/3 thời gian hết hạn của access token
  // thì tiến hành refresh token
  if (shouldRefreshToken) {
    try {
      const role = refreshTokenDecoded.role

      const response =
        role === Role.Guest
          ? await guestApi.refreshTokenFromBrowserToServer()
          : await authApi.refreshTokenFromBrowserToServer()

      const { accessToken, refreshToken } = response.payload.data

      setAccessTokenToLocalStorage(accessToken)
      setRefreshTokenToLocalStorage(refreshToken)

      params?.onSuccess && params.onSuccess(role)
    } catch (error) {
      params?.onError && params.onError()
    }
  }
}

export const formatCurrency = (number: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })
    .format(number)
    .replace('₫', '')
    .trim()
    .concat('đ')
}

export const getVietnameseDishStatus = (status: (typeof DishStatus)[keyof typeof DishStatus]) => {
  switch (status) {
    case DishStatus.Available:
      return 'Có sẵn'
    case DishStatus.Unavailable:
      return 'Không có sẵn'
    default:
      return 'Ẩn'
  }
}

export const getVietnameseTableStatus = (status: (typeof TableStatus)[keyof typeof TableStatus]) => {
  switch (status) {
    case TableStatus.Available:
      return 'Có sẵn'
    case TableStatus.Reserved:
      return 'Đã đặt'
    default:
      return 'Ẩn'
  }
}

export const getVietnameseOrderStatus = (status: (typeof OrderStatus)[keyof typeof OrderStatus]) => {
  switch (status) {
    case OrderStatus.Delivered:
      return 'Đã giao'
    case OrderStatus.Paid:
      return 'Đã thanh toán'
    case OrderStatus.Pending:
      return 'Chờ xử lý'
    case OrderStatus.Processing:
      return 'Đang làm món'
    default:
      return 'Từ chối'
  }
}

export const getTableLink = ({ tableToken, tableNumber }: { tableToken: string; tableNumber: number }) => {
  return envConfig.NEXT_PUBLIC_URL + '/tables/' + tableNumber + '?token=' + tableToken
}

export const decodeToken = (token: string) => {
  return jwt.decode(token) as TokenPayload
}

export function removeAccents(str: string) {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
}

export const simpleMatchText = (fullText: string, matchText: string) => {
  return removeAccents(fullText.toLowerCase()).includes(removeAccents(matchText.trim().toLowerCase()))
}

export const formatDateTimeToLocaleString = (date: string | Date) => {
  return format(date instanceof Date ? date : new Date(date), 'HH:mm:ss dd/MM/yyyy')
}

export const formatDateTimeToTimeString = (date: string | Date) => {
  return format(date instanceof Date ? date : new Date(date), 'HH:mm:ss')
}

export const OrderStatusIcon = {
  [OrderStatus.Pending]: Loader,
  [OrderStatus.Processing]: CookingPot,
  [OrderStatus.Rejected]: BookX,
  [OrderStatus.Delivered]: Truck,
  [OrderStatus.Paid]: HandCoins,
}
