import Image from 'next/image'

import dishApi from '@/api-requests/dish.api'
import { formatCurrency } from '@/utils'
import { DishListResType } from '@/lib/schema/dish.schema'

export default async function Homepage() {
  let dishes: DishListResType['data'] = []

  try {
    const response = await dishApi.getDishesFromBrowserToBackend()

    const { payload } = response
    dishes = payload.data
  } catch (error: any) {
    return (
      <div>
        <h1>Đã có lỗi xảy ra</h1>
        <p>{error.message || 'Something went wrong!'}</p>
      </div>
    )
  }

  return (
    <>
      <section className="relative">
        <span className="absolute left-0 top-0 z-10 size-full bg-black opacity-50"></span>
        <Image
          src="/banner.png"
          width={400}
          height={200}
          quality={100}
          alt="Banner"
          className="absolute left-0 top-0 size-full object-cover"
          priority
        />
        <div className="relative z-20 px-4 py-10 sm:px-10 md:p-20">
          <h1 className="text-center text-xl font-bold sm:text-2xl md:text-4xl lg:text-5xl">Wowwraps restaurant</h1>
          <p className="mt-4 text-center text-sm sm:text-base">Món ăn ngon, giá cả hợp lý, phục vụ nhanh chóng</p>
        </div>
      </section>
      <section className="space-y-10 py-16">
        <h2 className="text-center text-2xl font-bold">Đa dạng các món ăn</h2>
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {dishes.map((dish) => (
            <div className="flex gap-4" key={dish.id}>
              <div className="shrink-0">
                <Image
                  src={dish.image}
                  alt={dish.name}
                  width={150}
                  height={150}
                  quality={90}
                  className="size-[150px] rounded-md object-cover"
                  priority
                />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-semibold">{dish.name}</h3>
                <p className="">{dish.description}</p>
                <p className="font-semibold">{formatCurrency(dish.price)}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
