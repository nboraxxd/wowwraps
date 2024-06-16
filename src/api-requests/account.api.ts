import http from '@/utils/http'
import { AccountResType, ChangePasswordBodyType, UpdateMeBodyType } from '@/lib/schemaValidations/account.schema'

const accountApi = {
  // API OF BACKEND SERVER
  bGetMe: () => http.get<AccountResType>('/accounts/me'),
  bUpadateMe: (body: UpdateMeBodyType) => http.put<AccountResType>('/accounts/me', body),
  bChangePassword: (body: ChangePasswordBodyType) => http.put<AccountResType>('/accounts/change-password', body),

  // API OF NEXT.JS SERVER
}

export default accountApi
