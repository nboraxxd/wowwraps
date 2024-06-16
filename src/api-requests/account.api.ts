import http from '@/utils/http'
import { AccountResType, UpdateMeBodyType } from '@/lib/schemaValidations/account.schema'

const accountApi = {
  // API OF BACKEND SERVER
  bGetMe: () => http.get<AccountResType>('/accounts/me'),
  bUpadateMe: (data: UpdateMeBodyType) => http.put<AccountResType>('/accounts/me', data),

  // API OF NEXT.JS SERVER
}

export default accountApi
