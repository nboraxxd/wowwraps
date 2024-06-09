import LoginForm from '@/app/(public)/(logged-out)/login/login-form'

export default function LoginPage() {
  return (
    <div className="flex min-h-[calc(100vh-var(--header-height))] items-center justify-center">
      <LoginForm />
    </div>
  )
}
