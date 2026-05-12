import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

const PLAN_MAP: Record<string, string> = {
  estudantil: 'estudantil',
  profissional: 'profissional',
  institucional: 'institucional',
}

export async function POST(req: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')
  if (!sig) return NextResponse.json({ error: 'No signature' }, { status: 400 })

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = await createClient()

  // Log event (ignore duplicate webhook deliveries)
  await supabase.from('stripe_events').upsert({
    id: event.id,
    type: event.type,
    payload: event.data.object as unknown as Record<string, unknown>,
    processed: false,
  }, { onConflict: 'id', ignoreDuplicates: true })

  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription
      const userId = sub.metadata?.user_id
      const planId = sub.metadata?.plan_id
      if (userId && planId && PLAN_MAP[planId]) {
        await supabase.from('profiles').update({
          plan_id: PLAN_MAP[planId],
          stripe_subscription_id: sub.id,
          subscription_status: sub.status,
        }).eq('id', userId)
      }
      break
    }
    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription
      const userId = sub.metadata?.user_id
      if (userId) {
        await supabase.from('profiles').update({
          plan_id: 'free',
          subscription_status: 'canceled',
        }).eq('id', userId)
      }
      break
    }
    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice
      const customerId = invoice.customer as string
      await supabase.from('profiles')
        .update({ subscription_status: 'past_due' })
        .eq('stripe_customer_id', customerId)
      break
    }
  }

  await supabase.from('stripe_events').update({ processed: true }).eq('id', event.id)
  return NextResponse.json({ received: true })
}
