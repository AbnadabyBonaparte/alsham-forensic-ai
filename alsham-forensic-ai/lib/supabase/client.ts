import { createBrowserClient } from '@supabase/ssr'

// Degraded-mode fallbacks: when env vars are not configured (keys not set yet),
// createBrowserClient throws ("Your project's URL and Key are required"),
// crashing any client component that constructs the client at render/effect time
// (Navbar, DashboardNav, login, signup, settings) -> "Application error: a
// client-side exception has occurred". Fall back to harmless placeholders so the
// client constructs; auth calls simply fail lazily instead of blanking the page.
const PLACEHOLDER_URL = 'https://placeholder.supabase.co'
const PLACEHOLDER_KEY = 'placeholder-anon-key'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || PLACEHOLDER_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || PLACEHOLDER_KEY

  if (
    process.env.NODE_ENV !== 'production' &&
    (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  ) {
    console.warn(
      '[supabase] NEXT_PUBLIC_SUPABASE_URL/ANON_KEY not set — running in degraded mode with placeholders.'
    )
  }

  return createBrowserClient(url, anonKey)
}
