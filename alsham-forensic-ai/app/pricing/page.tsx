'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

const PLANS = [
  {
    id: 'free',
    name: 'Gratuito',
    price: 'R$0',
    period: '',
    features: ['3 análises/mês', 'Até 2.000 caracteres', 'Score + veredito', 'Sem PDF'],
    cta: 'Usar Gratuito',
    highlight: false,
    planKey: null,
  },
  {
    id: 'estudantil',
    name: 'Estudantil',
    price: 'R$29,90',
    period: '/mês',
    features: ['30 análises/mês', 'Até 8.000 caracteres', 'Links Google Scholar', 'Conformidade normativa'],
    cta: 'Assinar Estudantil',
    highlight: false,
    planKey: 'estudantil',
  },
  {
    id: 'profissional',
    name: 'Profissional',
    price: 'R$89,90',
    period: '/mês',
    features: ['150 análises/mês', 'Até 20.000 caracteres', 'Certificado PDF (CID)', 'Links Google Scholar', 'Prioridade na fila'],
    cta: 'Assinar Profissional',
    highlight: true,
    planKey: 'profissional',
  },
  {
    id: 'institucional',
    name: 'Institucional',
    price: 'R$497,00',
    period: '/mês',
    features: ['Análises ilimitadas', 'Até 50.000 caracteres', 'PDF + API access', 'Normativas personalizadas', 'Suporte prioritário'],
    cta: 'Contato Comercial',
    highlight: false,
    planKey: 'institucional',
  },
]

export default function PricingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  async function subscribe(planKey: string | null) {
    if (!planKey) { router.push('/signup'); return }
    if (planKey === 'institucional') { window.location.href = 'mailto:comercial@alshamglobal.com.br'; return }
    setLoading(planKey)
    const res = await fetch('/api/stripe/create-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planId: planKey }),
    })
    if (res.status === 401) { router.push(`/login?redirect=/pricing`); return }
    const { url } = await res.json() as { url?: string }
    if (url) window.location.href = url
    setLoading(null)
  }

  return (
    <div style={{ background: '#0A0F1E', minHeight: '100vh', padding: '80px 24px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <div style={{ fontSize: 10, letterSpacing: 4, color: '#C9A84C', marginBottom: 12 }}>PLANOS E PRECOS</div>
          <h1 style={{ fontSize: 40, fontWeight: 800, color: '#F8FAFC', marginBottom: 16 }}>Escolha seu plano</h1>
          <p style={{ color: '#94A3B8', fontSize: 16 }}>Comece gratuitamente. Faça upgrade quando precisar de mais.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
          {PLANS.map(plan => (
            <div
              key={plan.id}
              style={{
                background: plan.highlight ? '#1B2A4A' : '#111827',
                borderRadius: 16,
                padding: 28,
                border: plan.highlight ? '2px solid #C9A84C' : '1px solid #2D3A56',
                position: 'relative',
              }}
            >
              {plan.highlight && (
                <div style={{
                  position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
                  background: '#C9A84C', color: '#0A0F1E', fontSize: 10, fontWeight: 800,
                  letterSpacing: 2, padding: '4px 14px', borderRadius: 100,
                }}>MAIS POPULAR</div>
              )}
              <div style={{ fontSize: 14, fontWeight: 700, color: '#C9A84C', marginBottom: 8 }}>{plan.name}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 20 }}>
                <span style={{ fontSize: 32, fontWeight: 800, color: '#F8FAFC' }}>{plan.price}</span>
                <span style={{ fontSize: 14, color: '#94A3B8' }}>{plan.period}</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px' }}>
                {plan.features.map(f => (
                  <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, fontSize: 13, color: '#CBD5E1' }}>
                    <CheckCircle size={14} color="#16A34A" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                onClick={() => subscribe(plan.planKey)}
                disabled={loading === plan.planKey}
                style={{
                  width: '100%',
                  background: plan.highlight ? '#C9A84C' : 'transparent',
                  color: plan.highlight ? '#0A0F1E' : '#C9A84C',
                  border: plan.highlight ? 'none' : '1px solid #C9A84C',
                  fontWeight: 700,
                }}
              >
                {loading === plan.planKey ? 'Redirecionando...' : plan.cta}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
