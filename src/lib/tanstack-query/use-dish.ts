import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import dishApi from '@/api-requests/dish.api'
import { QueryKey } from '@/constants/query-key'
import { DishParamsType, DishResType, UpdateDishBodyType } from '@/lib/schemaValidations/dish.schema'

export function useGetDishesQuery() {
  return useQuery({
    queryFn: dishApi.getDishesFromBrowserToBackend,
    queryKey: [QueryKey.getDishes],
  })
}

export function useGetDishQuery(id?: DishParamsType['id'], onSuccess?: (data: DishResType) => void) {
  return useQuery({
    queryFn: () =>
      dishApi.getDishFromBrowserToBackend(id!).then((response) => {
        onSuccess && onSuccess(response.payload)
        return response
      }),
    queryKey: [QueryKey.getDish, id],
    enabled: !!id,
  })
}

export function useAddDishMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: dishApi.addDishFromBrowserToBackend,
    mutationKey: [QueryKey.addDish],
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QueryKey.getDishes],
      })
    },
  })
}

export function useUpdateDishMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, ...body }: UpdateDishBodyType & { id: DishParamsType['id'] }) =>
      dishApi.updateDishBrowserToBackend(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QueryKey.getDishes],
      })
    },
  })
}

export function useDeleteDishMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: dishApi.deleteDishFromBrowserToBackend,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QueryKey.getDishes],
      })
    },
  })
}
