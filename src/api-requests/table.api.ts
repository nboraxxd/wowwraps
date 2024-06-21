import http from '@/utils/http'
import {
  CreateTableBodyType,
  TableListResType,
  TableParamsType,
  TableResType,
  UpdateTableBodyType,
} from '@/lib/schemaValidations/table.schema'

const PREFIX = '/tables'

const tableApi = {
  getTablesFromBrowserToBackend: () => http.get<TableListResType>(PREFIX),

  addTableFromBrowserToBackend: (body: CreateTableBodyType) => http.post<TableResType>(PREFIX, body),

  getTableFromBrowserToBackend: (number: TableParamsType['number']) => http.get<TableResType>(`${PREFIX}/${number}`),

  updateTableFromBrowserToBackend: (number: TableParamsType['number'], body: UpdateTableBodyType) =>
    http.put<TableResType>(`${PREFIX}/${number}`, body),

  deleteTableFromBrowserToBackend: (number: TableParamsType['number']) =>
    http.delete<TableResType>(`${PREFIX}/${number}`),
}

export default tableApi
