'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Shield, FileText, Hash, AlertTriangle, CheckCircle, TrendingUp, BookOpen, Zap, Lock, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const PLANS = [
  {
    id: 'free',
    name: 'Gratuito',
    price: 'R$0',
    period: '',
    analyses: 3,
    chars: '2.000',
    pdf: false,
    api: false,
    scholar: false,
    cta: 'Analisar Agora',
    href: '/analyze',
    highlight: false,
  },
  {
    id: 'estudantil',
    name: 'Estudantil',
    price: 'R$29,90',
    period: '/mês',
    analyses: 30,
    chars: '8.000',
    pdf: false,
    api: false,
    scholar: true,
    cta: 'Assinar',
    href: '/signup?plan=estudantil',
    highlight: false,
  },
  {
    id: 'profissional',
    name: 'Profissional',
    price: 'R$89,90',
    period: '/mês',
    analyses: 150,
    chars: '20.000',
    pdf: true,
    api: false,
    scholar: true,
    cta: 'Assinar',
    href: '/signup?plan=profissional',
    highlight: true,
  },
  {
    id: 'institucional',
    name: 'Institucional',
    price: 'R$497,00',
    period: '/mês',
    analyses: -1,
    chars: '50.000',
    pdf: true,
    api: true,
    scholar: true,
    cta: 'Contato',
    href: 'mailto:comercial@alshamglobal.com.br',
    highlight: false,
  },
]

const COMPARISON = [
  { feature: 'Normativas CNPq 2664/2026', alsham: true, gptzero: false, turnitin: false, originality: false },
  { feature: 'Resolucao UFPB 57/2025', alsham: true, gptzero: false, turnitin: false, originality: false },
  { feature: 'Certificado CID com SHA-256', alsham: true, gptzero: false, turnitin: false, originality: false },
  { feature: 'Verificacao publica de hash', alsham: true, gptzero: false, turnitin: false, originality: false },
  { feature: 'Deteccao de burla (reenvio)', alsham: true, gptzero: false, turnitin: false, originality: false },
  { feature: 'Links Google Scholar', alsham: true, gptzero: true, turnitin: false, originality: false },
  { feature: 'Motor ensemble (2 LLMs)', alsham: true, gptzero: false, turnitin: false, originality: true },
  { feature: 'Precos em BRL', alsham: true, gptzero: false, turnitin: false, originality: false },
]

const DIFFERENTIALS = [
  {
    icon: Shield,
    title: 'Conformidade CNPq 2664/2026',
    desc: 'Unico sistema que cita artigos especificos da portaria em cada laudo. Aceito como evidencia em processo administrativo universitario.',
  },
  {
    icon: Hash,
    title: 'Certificado de Integridade Digital',
    desc: 'CID com hash SHA-256 verificavel publicamente. QR code para validacao instantanea. Imutavel e auditavel.',
  },
  {
    icon: AlertTriangle,
    title: 'Dosimetria de Sancao',
    desc: 'Detecta tentativa de burla por reenvio. Registra historico de submissoes e tendencia de score para processo disciplinar.',
  },
  {
    icon: BookOpen,
    title: 'Verificacao Bibliografica',
    desc: 'Cada citacao verificada em tempo real via Tavily + Scholar. Badge de risco: real, suspeita ou fantasma.',
  },
  {
    icon: Zap,
    title: 'Motor Ensemble Dual',
    desc: 'Claude claude-sonnet-4 (70%) + GPT-4o-mini (30%). Perplexidade, burstiness, fingerprinting de LLM por modelo.',
  },
  {
    icon: Lock,
    title: 'Laudo Juridicamente Redigido',
    desc: 'Resumo forense em linguagem tecnico-juridica. Recomendacao de acao para comissao disciplinar.',
  },
]

export default function LandingPage() {
  const [demoText, setDemoText] = useState('')

  return (
    <div style={{ background: '#0A0F1E', minHeight: '100vh', color: '#F8FAFC' }}>
      {/* Hero */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '100px 24px 80px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#1B2A4A', border: '1px solid #C9A84C33', borderRadius: 100, padding: '6px 16px', marginBottom: 24 }}>
          <Shield size={14} color="#C9A84C" />
          <span style={{ fontSize: 12, color: '#C9A84C', letterSpacing: 2 }}>CONFORMIDADE CNPQ 2664/2026 · UFPB 57/2025</span>
        </div>
        <h1 style={{ fontSize: 'clamp(32px, 5vw, 60px)', fontWeight: 800, lineHeight: 1.1, marginBottom: 24 }}>
          Oúnico detector forense de IA{' '}
          <span style={{ color: '#C9A84C' }}>com conformidade jurídica</span>
          {' '}institucional
        </h1>
        <p style={{ fontSize: 18, color: '#94A3B8', maxWidth: 680, margin: '0 auto 40px', lineHeight: 1.7 }}>
          Laudos forenses com referencia à Portaria CNPq 2664/2026 e Resolução UFPB 57/2025.
          Certificado de Integridade Digital com hash SHA-256 verificavel publicamente.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/signup">
            <Button style={{ background: '#C9A84C', color: '#0A0F1E', fontWeight: 700, padding: '12px 28px', fontSize: 15 }}>
              Analisar Gratuitamente
            </Button>
          </Link>
          <Link href="/pricing">
            <Button variant="outline" style={{ borderColor: '#C9A84C33', color: '#C9A84C', padding: '12px 28px', fontSize: 15 }}>
              Ver Planos
            </Button>
          </Link>
        </div>
        <p style={{ marginTop: 16, fontSize: 12, color: '#64748B' }}>Sem cartão · 3 análises gratuitas · Resultado em &lt;30 segundos</p>
      </section>

      {/* Demo box */}
      <section style={{ maxWidth: 800, margin: '0 auto 80px', padding: '0 24px' }}>
        <div style={{ background: '#1B2A4A', borderRadius: 16, padding: 32, border: '1px solid #2D3A56' }}>
          <div style={{ fontSize: 11, letterSpacing: 3, color: '#C9A84C', marginBottom: 12 }}>DEMO INTERATIVO</div>
          <textarea
            value={demoText}
            onChange={e => setDemoText(e.target.value)}
            placeholder="Cole um trecho de texto acadêmico aqui (mínimo 80 caracteres) para testar gratuitamente..."
            style={{
              width: '100%', minHeight: 120, background: '#0A0F1E', color: '#F8FAFC',
              border: '1px solid #2D3A56', borderRadius: 8, padding: 14, fontSize: 14,
              boxSizing: 'border-box', resize: 'vertical', outline: 'none', fontFamily: 'inherit',
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
            <span style={{ fontSize: 12, color: '#64748B' }}>{demoText.length} / 2.000 caracteres</span>
            <Link href={`/analyze?demo=${encodeURIComponent(demoText.slice(0, 200))}`}>
              <Button
                disabled={demoText.length < 80}
                style={{ background: demoText.length >= 80 ? '#C9A84C' : '#2D3A56', color: demoText.length >= 80 ? '#0A0F1E' : '#64748B', fontWeight: 700 }}
              >
                Analisar Texto
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Differentials */}
      <section style={{ maxWidth: 1100, margin: '0 auto 80px', padding: '0 24px' }}>
        <h2 style={{ fontSize: 32, fontWeight: 700, textAlign: 'center', marginBottom: 48 }}>
          Por que o <span style={{ color: '#C9A84C' }}>ALSHAM Forensic</span> é diferente
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
          {DIFFERENTIALS.map(d => (
            <div key={d.title} style={{ background: '#1B2A4A', borderRadius: 12, padding: 24, border: '1px solid #2D3A56' }}>
              <d.icon size={24} color="#C9A84C" style={{ marginBottom: 12 }} />
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>{d.title}</h3>
              <p style={{ fontSize: 13, color: '#94A3B8', lineHeight: 1.6 }}>{d.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Comparison */}
      <section style={{ maxWidth: 1000, margin: '0 auto 80px', padding: '0 24px' }}>
        <h2 style={{ fontSize: 32, fontWeight: 700, textAlign: 'center', marginBottom: 48 }}>
          ALSHAM vs Concorrentes
        </h2>
        <div style={{ background: '#1B2A4A', borderRadius: 16, overflow: 'hidden', border: '1px solid #2D3A56' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #2D3A56' }}>
                <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: 12, color: '#94A3B8' }}>Funcionalidade</th>
                <th style={{ padding: '16px 12px', textAlign: 'center', fontSize: 12, color: '#C9A84C', fontWeight: 800 }}>ALSHAM</th>
                <th style={{ padding: '16px 12px', textAlign: 'center', fontSize: 12, color: '#94A3B8' }}>GPTZero</th>
                <th style={{ padding: '16px 12px', textAlign: 'center', fontSize: 12, color: '#94A3B8' }}>Turnitin</th>
                <th style={{ padding: '16px 12px', textAlign: 'center', fontSize: 12, color: '#94A3B8' }}>Originality</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON.map((row, i) => (
                <tr key={row.feature} style={{ borderBottom: i < COMPARISON.length - 1 ? '1px solid #0F1A2E' : 'none' }}>
                  <td style={{ padding: '14px 20px', fontSize: 13, color: '#CBD5E1' }}>{row.feature}</td>
                  {(['alsham', 'gptzero', 'turnitin', 'originality'] as const).map(col => (
                    <td key={col} style={{ padding: '14px 12px', textAlign: 'center' }}>
                      {row[col]
                        ? <CheckCircle size={16} color={col === 'alsham' ? '#16A34A' : '#94A3B8'} />
                        : <span style={{ color: '#374151', fontSize: 18 }}>-</span>
                      }
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Stats */}
      <section style={{ background: '#1B2A4A', padding: '60px 24px', marginBottom: 80 }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 32, textAlign: 'center' }}>
          {[
            { value: '$142M', label: 'Mercado global 2025' },
            { value: '34%', label: 'Crescimento anual' },
            { value: '8M+', label: 'Estudantes de pós no Brasil' },
            { value: '<30s', label: 'Tempo de análise' },
          ].map(s => (
            <div key={s.label}>
              <div style={{ fontSize: 36, fontWeight: 800, color: '#C9A84C' }}>{s.value}</div>
              <div style={{ fontSize: 13, color: '#94A3B8', marginTop: 6 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ maxWidth: 700, margin: '0 auto 80px', padding: '0 24px', textAlign: 'center' }}>
        <h2 style={{ fontSize: 36, fontWeight: 800, marginBottom: 16 }}>
          Comece a usar <span style={{ color: '#C9A84C' }}>gratuitamente</span>
        </h2>
        <p style={{ color: '#94A3B8', marginBottom: 32, fontSize: 16 }}>
          3 análises gratuitas. Sem cartão de crédito. Resultado em menos de 30 segundos.
        </p>
        <Link href="/signup">
          <Button style={{ background: '#C9A84C', color: '#0A0F1E', fontWeight: 700, padding: '14px 36px', fontSize: 16 }}>
            Criar Conta Gratuita
          </Button>
        </Link>
      </section>
    </div>
  )
}
