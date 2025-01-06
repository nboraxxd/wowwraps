import Link from 'next/link'
import { cookies } from 'next/headers'

import accountApi from '@/api-requests/account.api'
import { Button } from '@/components/ui/button'

export default async function DashboardPage() {
  const cookieStore = cookies()
  const accessToken = cookieStore.get('accessToken')!.value

  let name = ''

  try {
    const response = await accountApi.getMeFromServerToBackend(accessToken)
    name = response.payload.data.name
  } catch (error: any) {
    if (error.digest?.includes('NEXT_REDIRECT')) {
      throw error
    }
  }

  return (
    <div>
      <p>DashBoardPage {name}</p>
      <div className="space-x-2">
        <Button asChild>
          <Link href="/login">Login</Link>
        </Button>
        <Button asChild>
          <Link href="/manage/setting">Setting</Link>
        </Button>
      </div>
    </div>
  )
}
