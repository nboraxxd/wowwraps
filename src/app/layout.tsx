import type { Metadata } from 'next'
import { Inter as FontSans } from 'next/font/google'

// import { cn } from '@/utils'
import { Toaster } from '@/components/ui/sonner'
import { RefreshToken } from '@/components/common'
import { TanstackQueryProvider, ThemeProvider, AuthProvider } from '@/components/provider'
import './globals.css'

const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans',
})

export const metadata: Metadata = {
  title: 'WowWraps',
  description: 'The order management system for WowWraps',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn('min-h-screen bg-background font-sans antialiased', fontSans.variable)}>
        <TanstackQueryProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <AuthProvider>
              {children}
              <RefreshToken />
            </AuthProvider>
            <Toaster />
          </ThemeProvider>
        </TanstackQueryProvider>
      </body>
    </html>
  )
}
