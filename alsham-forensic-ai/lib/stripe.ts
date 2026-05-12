import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
})

export const PRICE_IDS: Record<string, string> = {
  estudantil: process.env.STRIPE_PRICE_ESTUDANTIL!,
  profissional: process.env.STRIPE_PRICE_PROFISSIONAL!,
  institucional: process.env.STRIPE_PRICE_INSTITUCIONAL!,
}
