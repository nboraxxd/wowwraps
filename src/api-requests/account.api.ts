import http from '@/utils/http'
import {
  AccountIdParamType,
  AccountListResType,
  AccountResType,
  ChangePasswordBodyType,
  CreateEmployeeAccountBodyType,
  UpdateEmployeeAccountBodyType,
  UpdateMeBodyType,
} from '@/lib/schemaValidations/account.schema'

const PREFIX = '/accounts'

const accountApi = {
  // API OF BACKEND SERVER
  // getMeFromBrowserToBackend sẽ được gọi từ browser nên không cần truyền accessToken
  getMeFromBrowserToBackend: () => http.get<AccountResType>(`${PREFIX}/me`),

  // getMeFromServerToBackend sẽ được gọi từ Next.js server nên cần tự thêm accessToken vào headers.Authorization
  getMeFromServerToBackend: (accessToken: string) =>
    http.get<AccountResType>(`${PREFIX}/me`, { headers: { Authorization: `Bearer ${accessToken}` } }),

  upadateMeFromBrowserToBackend: (body: UpdateMeBodyType) => http.put<AccountResType>(`${PREFIX}/me`, body),

  changePasswordFromBrowserToBackend: (body: ChangePasswordBodyType) =>
    http.put<AccountResType>(`${PREFIX}/change-password`, body),

  getEmployeesFromBrowserToBackend: () => http.get<AccountListResType[]>(PREFIX),

  addEmployeeFromBrowserToBackend: (body: CreateEmployeeAccountBodyType) => http.post<AccountResType>(PREFIX, body),

  getEmployeeFromBrowserToBackend: (id: AccountIdParamType['id']) => http.get<AccountResType>(`${PREFIX}/detail/${id}`),

  updateEmployeeFromBrowserToBackend: (id: AccountIdParamType['id'], body: UpdateEmployeeAccountBodyType) =>
    http.put<AccountResType>(`${PREFIX}/detail/${id}`, body),

  deleteEmployeeFromBrowserToBackend: (id: AccountIdParamType['id']) =>
    http.delete<AccountResType>(`${PREFIX}/detail/${id}`),

  // API OF NEXT.JS SERVER
}

export default accountApi
