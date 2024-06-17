import { cookies } from 'next/headers'

import accountApi from '@/api-requests/account.api'

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

  return <div>DashBoardPage {name}</div>
}
