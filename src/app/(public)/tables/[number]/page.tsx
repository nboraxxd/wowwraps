import { RedirectType, redirect } from 'next/navigation'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { GuestLoginForm } from '@/components/form'

interface Props {
  params: { number: string }
  searchParams: { token?: string }
}

export default function TableNumberPage({ params: { number }, searchParams: { token } }: Props) {
  if (!token) redirect('/', RedirectType.replace)

  return (
    <div className="flex min-h-[calc(100vh-var(--header-height))] items-center justify-center">
      <Card className="mx-auto max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Đăng nhập gọi món</CardTitle>
          <CardDescription>Vui lòng nhập thông tin để được phục vụ tốt nhất</CardDescription>
        </CardHeader>
        <CardContent>
          <GuestLoginForm token={token} tableNumber={+number} />
        </CardContent>
      </Card>
    </div>
  )
}
