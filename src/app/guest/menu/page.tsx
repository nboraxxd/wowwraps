import MenuOrder from '@/app/guest/menu/menu-order'

export default async function GuestMenuPage() {
  return (
    <div className="mx-auto max-w-[400px] space-y-4 pb-12 pt-6">
      <h1 className="text-center text-xl font-bold">🍕 Menu</h1>
      <MenuOrder />
    </div>
  )
}
