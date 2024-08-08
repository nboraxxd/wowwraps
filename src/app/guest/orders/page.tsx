import OrdersCart from '@/app/guest/orders/orders-cart'

export default function OrdersPage() {
  return (
    <div className="mx-auto max-w-[400px] space-y-4 pb-12 pt-6">
      <h1 className="text-center text-xl font-bold">Đơn hàng 📃</h1>
      <OrdersCart />
    </div>
  )
}
