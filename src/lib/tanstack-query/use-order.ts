import { useMutation, useQuery } from '@tanstack/react-query'

import orderApi from '@/api-requests/order.api'
import { QueryKey } from '@/constants/query-key'
import { OrderParamType, UpdateOrderBodyType } from '@/lib/schema/order.schema'

export function useGetOrdersQuery() {
  return useQuery({ queryFn: orderApi.getOrdersFromBrowserToBackend, queryKey: [QueryKey.getOrders] })
}

export function useUpdateOrderMutation() {
  return useMutation({
    mutationFn: ({ orderId, ...body }: UpdateOrderBodyType & { orderId: OrderParamType['orderId'] }) =>
      orderApi.updateOrderFromBrowserToBackend(orderId, body),
  })
}
