import Link from 'next/link'

import { Button } from '@/components/ui/button'

export default function Homepage() {
  return (
    <main className="flex gap-2">
      <Button asChild>
        <Link href="/login">Login</Link>
      </Button>
      <Button asChild>
        <Link href="/manage/setting">Setting</Link>
      </Button>
    </main>
  )
}
