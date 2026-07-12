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
    <div style={{ position: 'relative', background: 'var(--bg-app)', minHeight: '100vh', padding: '96px 24px 88px', overflow: 'hidden' }}>
      {/* shared gallery-grade depth */}
      <div className="ambient-scene" aria-hidden />

      <div className="above" style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <div className="eyebrow" style={{ marginBottom: 14 }}>PLANOS E PREÇOS</div>
          <h1 className="page-title" style={{ marginBottom: 16 }}>
            Escolha seu <span className="text-gold-gradient">plano forense</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 16 }}>Comece gratuitamente. Faça upgrade quando precisar de mais.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20, alignItems: 'stretch' }}>
          {PLANS.map(plan => (
            <div
              key={plan.id}
              className="frame-card"
              style={{
                padding: '34px 28px 28px',
                border: plan.highlight ? '1.5px solid color-mix(in srgb, var(--brand-gold) 60%, transparent)' : '1px solid var(--border-soft)',
                boxShadow: plan.highlight ? '0 24px 60px -30px rgba(199,162,74,0.5)' : 'none',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {plan.highlight && (
                <div style={{
                  position: 'absolute', top: -11, left: '50%', transform: 'translateX(-50%)',
                  background: 'linear-gradient(180deg, var(--gold-hover), var(--brand-gold))', color: 'var(--ink-950)',
                  fontSize: 10, fontWeight: 800, letterSpacing: '0.12em', padding: '5px 16px', borderRadius: 999,
                  fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap',
                  boxShadow: '0 8px 24px -10px rgba(199,162,74,0.6)',
                }}>MAIS POPULAR</div>
              )}
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--brand-gold)', marginBottom: 10 }}>{plan.name}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 22 }}>
                <span style={{ fontSize: 33, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>{plan.price}</span>
                <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>{plan.period}</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', flex: 1 }}>
                {plan.features.map(f => (
                  <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 9, marginBottom: 11, fontSize: 13, color: 'var(--text-secondary)' }}>
                    <CheckCircle size={14} color="var(--status-success)" style={{ marginTop: 2, flexShrink: 0 }} />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                onClick={() => subscribe(plan.planKey)}
                disabled={loading === plan.planKey}
                className={plan.highlight ? 'btn-gold' : undefined}
                style={plan.highlight ? { width: '100%', height: 44 } : {
                  width: '100%', height: 44,
                  background: 'transparent', color: 'var(--brand-gold)',
                  border: '1px solid color-mix(in srgb, var(--brand-gold) 45%, transparent)',
                  fontWeight: 700,
                }}
              >
                {loading === plan.planKey ? 'Redirecionando...' : plan.cta}
              </Button>
            </div>
          ))}
        </div>

        <p style={{ textAlign: 'center', marginTop: 44, fontSize: 12.5, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.04em' }}>
          Todos os planos incluem Certificado de Integridade Digital com hash SHA-256 verificável.
        </p>
      </div>
    </div>
  )
}
