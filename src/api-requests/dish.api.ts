import {
  CreateDishBodyType,
  DishListResType,
  DishParamsType,
  UpdateDishBodyType,
} from '@/lib/schemaValidations/dish.schema'
import http from '@/utils/http'

const PREFIX = '/dishes'

const dishApi = {
  getDishesFromBrowserToBackend: () => http.get<DishListResType>(PREFIX),

  getDishFromBrowserToBackend: (id: DishParamsType['id']) => http.get(`${PREFIX}/${id}`),

  addDishFromBrowserToBackend: (body: CreateDishBodyType) => http.post(PREFIX, body),

  updateDishBrowserToBackend: (id: DishParamsType['id'], body: UpdateDishBodyType) =>
    http.post(`${PREFIX}/${id}`, body),

  deleteDishFromBrowserToBackend: (id: DishParamsType['id']) => http.delete(`${PREFIX}/${id}`),
}

export default dishApi
