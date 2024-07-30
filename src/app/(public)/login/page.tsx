import { Suspense } from 'react'

import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LoginForm } from '@/components/form'

const loginFields = [
  { label: 'Email', placeholder: 'bruce@wayne.dc' },
  { label: 'Password', placeholder: 'Please enter your password' },
]

export default function LoginPage() {
  return (
    <div className="flex min-h-[calc(100vh-var(--header-height))] items-center justify-center">
      <Card className="mx-auto max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Đăng nhập</CardTitle>
          <CardDescription>Nhập email và mật khẩu của bạn để đăng nhập vào hệ thống</CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<LoginFormSkeleton itemList={loginFields} />}>
            <LoginForm />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}

function LoginFormSkeleton({ itemList }: { itemList: Array<{ label: string; placeholder: string }> }) {
  return (
    <div className="grid gap-4">
      {itemList.map(({ label, placeholder }, i) => (
        <div key={i} className="flex flex-col gap-2">
          <Label>{label}</Label>
          <Input readOnly placeholder={placeholder} />
        </div>
      ))}
      <Button className="w-full">Đăng nhập</Button>
      <Button variant="outline" className="w-full">
        Đăng nhập bằng Google
      </Button>
    </div>
  )
}
