import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { GuestLoginForm } from '@/components/form'

export default function TableNumberPage() {
  return (
    <div className="flex min-h-[calc(100vh-var(--header-height))] items-center justify-center">
      <Card className="mx-auto max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Đăng nhập gọi món</CardTitle>
          <CardDescription>Vui lòng nhập thông tin để được phục vụ tốt nhất</CardDescription>
        </CardHeader>
        <CardContent>
          <GuestLoginForm />
        </CardContent>
      </Card>
    </div>
  )
}
