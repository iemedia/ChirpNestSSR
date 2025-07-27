import '@/styles/globals.css'
import type { Metadata } from 'next'
import { ReactNode } from 'react'
import SupabaseProvider from './SupabaseProvider'

export const metadata: Metadata = {
  title: 'ChirpNest',
  description: 'Real-time social feed with Supabase & Next.js',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SupabaseProvider>{children}</SupabaseProvider>
      </body>
    </html>
  )
}
