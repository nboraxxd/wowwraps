import http from '@/utils/http'
import { AccountResType, ChangePasswordBodyType, UpdateMeBodyType } from '@/lib/schemaValidations/account.schema'

const accountApi = {
  // API OF BACKEND SERVER
  // getMeFromBrowserToBackend sẽ được gọi từ browser nên không cần truyền accessToken
  getMeFromBrowserToBackend: () => http.get<AccountResType>('/accounts/me'),

  // getMeFromServerToBackend sẽ được gọi từ Next.js server nên cần tự thêm accessToken vào headers.Authorization
  getMeFromServerToBackend: (accessToken: string) =>
    http.get<AccountResType>('/accounts/me', { headers: { Authorization: `Bearer ${accessToken}` } }),

  upadateMeFromBrowserToBackend: (body: UpdateMeBodyType) => http.put<AccountResType>('/accounts/me', body),

  changePasswordFromBrowserToBackend: (body: ChangePasswordBodyType) =>
    http.put<AccountResType>('/accounts/change-password', body),

  // API OF NEXT.JS SERVER
}

export default accountApi
