import {
  CreateDishBodyType,
  DishListResType,
  DishParamsType,
  DishResType,
  UpdateDishBodyType,
} from '@/lib/schema/dish.schema'
import http from '@/utils/http'

const PREFIX = '/dishes'

const dishApi = {
  getDishesFromBrowserToBackend: () => http.get<DishListResType>(PREFIX, { next: { tags: ['dishes'] } }),

  getDishFromBrowserToBackend: (id: DishParamsType['id']) => http.get<DishResType>(`${PREFIX}/${id}`),

  addDishFromBrowserToBackend: (body: CreateDishBodyType) => http.post<DishResType>(PREFIX, body),

  updateDishBrowserToBackend: (id: DishParamsType['id'], body: UpdateDishBodyType) =>
    http.put<DishResType>(`${PREFIX}/${id}`, body),

  deleteDishFromBrowserToBackend: (id: DishParamsType['id']) => http.delete<DishResType>(`${PREFIX}/${id}`),
}

export default dishApi
