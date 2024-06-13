'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Settings } from 'lucide-react'

import { cn } from '@/utils'
import { menuItems } from '@/constants/list'
import { LogoIcon } from '@/components/icons'
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip'

export default function NavLinks() {
  const pathname = usePathname()

  return (
    <TooltipProvider>
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
        <nav className="flex flex-col items-center gap-4 px-2 py-4">
          <Link href="/" className="group mb-5">
            <LogoIcon className="size-8 transition-transform group-hover:scale-110" />
            <span className="sr-only">WowWraps</span>
          </Link>

          {menuItems.map(({ Icon, href, title }, index) => {
            const isActive = pathname === href
            return (
              <Tooltip key={index}>
                <TooltipTrigger asChild>
                  <Link
                    href={href}
                    className={cn(
                      'flex size-9 items-center justify-center rounded-lg transition-colors hover:text-foreground',
                      isActive ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
                    )}
                  >
                    <Icon className="size-5" />
                    <span className="sr-only">{title}</span>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">{title}</TooltipContent>
              </Tooltip>
            )
          })}
        </nav>
        <nav className="mt-auto flex flex-col items-center gap-4 px-2 py-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href="/manage/setting"
                className={cn(
                  'flex size-9 items-center justify-center rounded-lg transition-colors hover:text-foreground md:size-8',
                  pathname === '/manage/setting' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
                )}
              >
                <Settings className="size-5" />
                <span className="sr-only">Cài đặt</span>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">Cài đặt</TooltipContent>
          </Tooltip>
        </nav>
      </aside>
    </TooltipProvider>
  )
}
