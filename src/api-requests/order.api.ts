import queryString from 'query-string'

import http from '@/utils/http'
import {
  CreateOrdersBodyType,
  CreateOrdersResType,
  GetOrderDetailResType,
  GetOrdersQueryParamsType,
  GetOrdersResType,
  OrderParamType,
  PayGuestOrdersBodyType,
  PayGuestOrdersResType,
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

  createOrderFromBrowserToBackend: (body: CreateOrdersBodyType) => http.post<CreateOrdersResType>(PREFIX, body),

  updateOrderFromBrowserToBackend: (orderId: OrderParamType['orderId'], body: UpdateOrderBodyType) =>
    http.put<UpdateOrderResType>(`${PREFIX}/${orderId}`, body),

  getOrderDetailFromBrowserToBackend: (oderId: number) => http.get<GetOrderDetailResType>(`${PREFIX}/${oderId}`),

  payGuestOrders: (body: PayGuestOrdersBodyType) => http.post<PayGuestOrdersResType>(`${PREFIX}/pay`, body),
}

export default orderApi
