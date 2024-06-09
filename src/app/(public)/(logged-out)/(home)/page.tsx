import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function Homepage() {
  return (
    <main>
      <Button asChild>
        <Link href="/login">Login</Link>
      </Button>
    </main>
  )
}
