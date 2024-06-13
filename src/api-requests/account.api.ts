import http from '@/utils/http'
import { AccountResType } from '@/lib/schemaValidations/account.schema'

const accountApi = {
  // API OF BACKEND SERVER
  bGetMe: () => http.get<AccountResType>('/accounts/me'),

  // API OF NEXT.JS SERVER
}

export default accountApi
