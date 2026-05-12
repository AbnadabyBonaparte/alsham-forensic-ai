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

if (process.env.NEXT_PHASE !== 'phase-production-build') {
  for (const key of required) {
    if (!process.env[key]) {
      throw new Error(`Missing required environment variable: ${key}`)
    }
  }
}

export const env = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  anthropicKey: process.env.ANTHROPIC_API_KEY!,
  openaiKey: process.env.OPENAI_API_KEY!,
  tavilyKey: process.env.TAVILY_API_KEY,
  stripeSecret: process.env.STRIPE_SECRET_KEY!,
  stripeWebhook: process.env.STRIPE_WEBHOOK_SECRET!,
  resendKey: process.env.RESEND_API_KEY!,
  appUrl: process.env.NEXT_PUBLIC_APP_URL!,
} as const
