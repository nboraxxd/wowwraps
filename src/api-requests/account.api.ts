import http from '@/utils/http'
import { AccountResType, ChangePasswordBodyType, UpdateMeBodyType } from '@/lib/schemaValidations/account.schema'

const accountApi = {
  // API OF BACKEND SERVER
  getMeFromBrowserToBackend: () => http.get<AccountResType>('/accounts/me'),

  upadateMeFromBrowserToBackend: (body: UpdateMeBodyType) => http.put<AccountResType>('/accounts/me', body),
  changePasswordFromBrowserToBackend: (body: ChangePasswordBodyType) =>
    http.put<AccountResType>('/accounts/change-password', body),

  // API OF NEXT.JS SERVER
}

export default accountApi
