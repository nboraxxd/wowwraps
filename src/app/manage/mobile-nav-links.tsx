'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { PanelLeft } from 'lucide-react'

import { cn } from '@/utils'
import menuItems from '@/app/manage/menuItems'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { LogoIcon } from '@/components/icons'

export default function MobileNavLinks() {
  const pathname = usePathname()

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button size="icon" variant="outline" className="sm:hidden">
          <PanelLeft className="size-5" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="sm:max-w-xs">
        <nav className="grid gap-6 text-lg font-medium">
          <Link href="/" className="group">
            <LogoIcon className="size-7 transition-transform group-hover:scale-110" />
            <span className="sr-only">WowWraps</span>
          </Link>
          {menuItems.map(({ Icon, href, title }, index) => {
            const isActive = pathname === href
            return (
              <Link
                key={index}
                href={href}
                className={cn('flex items-center gap-4 px-2.5  hover:text-foreground', {
                  'text-foreground': isActive,
                  'text-muted-foreground': !isActive,
                })}
              >
                <Icon className="size-5" />
                {title}
              </Link>
            )
          })}
        </nav>
      </SheetContent>
    </Sheet>
  )
}
