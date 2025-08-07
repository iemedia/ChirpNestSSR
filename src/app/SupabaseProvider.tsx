// src/app/SupabaseProvider.tsx
'use client'

import { ReactNode, useState } from 'react'
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs'
import { SessionContextProvider } from '@supabase/auth-helpers-react'
import type { Database } from '@/types/supabase'

export default function SupabaseProvider({ children }: { children: ReactNode }) {
  const [supabaseClient] = useState(() => createPagesBrowserClient<Database>())

  return (
    <SessionContextProvider supabaseClient={supabaseClient}>
      {children}
    </SessionContextProvider>
  )
}
