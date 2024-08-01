import http from '@/utils/http'
import { GetOrdersResType, OrderParamType, UpdateOrderBodyType, UpdateOrderResType } from '@/lib/schema/order.schema'

const PREFIX = '/orders'

const orderApi = {
  getOrdersFromBrowserToBackend: () => http.get<GetOrdersResType>(PREFIX),

  updateOrderFromBrowserToBackend: (orderId: OrderParamType['orderId'], body: UpdateOrderBodyType) =>
    http.put<UpdateOrderResType>(`${PREFIX}/${orderId}`, body),
}

export default orderApi
