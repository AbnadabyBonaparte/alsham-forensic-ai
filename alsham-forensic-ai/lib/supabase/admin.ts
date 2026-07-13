import { createClient } from '@supabase/supabase-js'

/**
 * Server-only Supabase client authenticated with the service-role key.
 *
 * Use this for trusted back-office writes that are NOT tied to an end-user
 * session and must bypass Row Level Security — currently the Stripe webhook,
 * which (a) writes the `stripe_events` idempotency log (a service-role-only
 * table) and (b) updates arbitrary `profiles` rows keyed by
 * `stripe_customer_id` after a payment event. Neither is possible with the
 * anon/SSR client once RLS is enabled.
 *
 * NEVER import this into client components — the service-role key must stay on
 * the server. It is intentionally not prefixed with NEXT_PUBLIC_.
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  )
}
