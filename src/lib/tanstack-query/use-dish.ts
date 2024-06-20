import dishApi from '@/api-requests/dish.api'
import { QueryKey } from '@/constants/query-key'
import { DishParamsType, UpdateDishBodyType } from '@/lib/schemaValidations/dish.schema'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export function useGetDishesQuery() {
  return useQuery({
    queryFn: dishApi.getDishesFromBrowserToBackend,
    queryKey: [QueryKey.addDish],
  })
}

export function useGetDishQuery(id: DishParamsType['id']) {
  return useQuery({
    queryFn: () => dishApi.getDishFromBrowserToBackend(id),
    queryKey: [QueryKey.getDish, id],
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
