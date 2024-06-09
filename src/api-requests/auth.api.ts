import http from '@/utils/http'
import { LoginBodyType, LoginResType } from '@/lib/schemaValidations/auth.schema'
import envConfig from '@/constants/config'

const authApi = {
  // API of backend server
  bLogin: (body: LoginBodyType) => http.post<LoginResType>('/auth/login', body),

  // API of Next.js server
  nLogin: (body: LoginBodyType) =>
    http.post<LoginResType>('/api/auth/login', body, { baseUrl: envConfig.NEXT_PUBLIC_URL }),
}

export default authApi
