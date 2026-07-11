const required = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'ANTHROPIC_API_KEY',
  'OPENAI_API_KEY',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
  'RESEND_API_KEY',
  'NEXT_PUBLIC_APP_URL',
] as const

// Never throw at import/boot for missing env. Throwing here can propagate into
// a client component render (this module or its values being pulled into the
// client bundle) and blank the whole site with "Application error: a client-side
// exception has occurred". Instead, warn and let each feature degrade lazily
// when it actually needs a key. Real values are still surfaced when env IS set.
const missing = required.filter((key) => !process.env[key])
if (missing.length > 0) {
  console.warn(
    `[env] Missing environment variable(s): ${missing.join(', ')}. ` +
      `Running in degraded mode — related features will be unavailable until configured.`
  )
}

export const env = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
  anthropicKey: process.env.ANTHROPIC_API_KEY ?? '',
  openaiKey: process.env.OPENAI_API_KEY ?? '',
  tavilyKey: process.env.TAVILY_API_KEY,
  stripeSecret: process.env.STRIPE_SECRET_KEY ?? '',
  stripeWebhook: process.env.STRIPE_WEBHOOK_SECRET ?? '',
  resendKey: process.env.RESEND_API_KEY ?? '',
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? '',
} as const
