import { useMutation, useQuery } from '@tanstack/react-query'

import orderApi from '@/api-requests/order.api'
import { QueryKey } from '@/constants/query-key'
import { GetOrdersQueryParamsType, OrderParamType, UpdateOrderBodyType } from '@/lib/schema/order.schema'

export function useGetOrdersQuery(queryParams: GetOrdersQueryParamsType) {
  return useQuery({
    queryFn: () => orderApi.getOrdersFromBrowserToBackend(queryParams),
    queryKey: [QueryKey.getOrders, queryParams],
  })
}

export function useGetOrderDetailQuery(orderId: OrderParamType['orderId'], enabled: boolean = true) {
  return useQuery({
    queryFn: () => orderApi.getOrderDetailFromBrowserToBackend(orderId),
    queryKey: [QueryKey.getOrderDetail, orderId],
    enabled,
  })
}

export function useUpdateOrderMutation() {
  return useMutation({
    mutationFn: ({ orderId, ...body }: UpdateOrderBodyType & { orderId: OrderParamType['orderId'] }) =>
      orderApi.updateOrderFromBrowserToBackend(orderId, body),
  })
}

export function usePayGuestOrdersMutation() {
  return useMutation({
    mutationFn: orderApi.payGuestOrders,
  })
}
