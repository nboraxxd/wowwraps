import queryString from 'query-string'

import http from '@/utils/http'
import {
  GetOrderDetailResType,
  GetOrdersQueryParamsType,
  GetOrdersResType,
  OrderParamType,
  UpdateOrderBodyType,
  UpdateOrderResType,
} from '@/lib/schema/order.schema'

const PREFIX = '/orders'

const orderApi = {
  getOrdersFromBrowserToBackend: (queryParams: GetOrdersQueryParamsType) =>
    http.get<GetOrdersResType>(
      `${PREFIX}?${queryString.stringify({
        fromDate: queryParams.fromDate?.toISOString(),
        toDate: queryParams.toDate?.toISOString(),
      })}`
    ),

  updateOrderFromBrowserToBackend: (orderId: OrderParamType['orderId'], body: UpdateOrderBodyType) =>
    http.put<UpdateOrderResType>(`${PREFIX}/${orderId}`, body),

  getOrderDetailFromBrowserToBackend: (oderId: number) => http.get<GetOrderDetailResType>(`${PREFIX}/${oderId}`),
}

export default orderApi
