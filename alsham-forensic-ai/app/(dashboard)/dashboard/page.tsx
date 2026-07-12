import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { FileText, TrendingUp, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatDate, verdictColor } from '@/lib/utils'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [profileRes, recentRes] = await Promise.all([
    supabase.from('profiles').select('*, plans(*)').eq('id', user!.id).single(),
    supabase
      .from('analyses')
      .select('id, overall_ai_score, verdict, created_at, institution_id, cid_code')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false })
      .limit(10),
  ])

  const profile = profileRes.data
  const recent = recentRes.data ?? []
  const plan = profile?.plans as Record<string, unknown> | null
  const used = profile?.analyses_used_this_month ?? 0
  const limit = (plan?.analyses_per_month as number) ?? 3
  const usedPct = limit === -1 ? 0 : Math.min((used / limit) * 100, 100)

  return (
    <div style={{ padding: '40px clamp(24px, 4vw, 48px)', maxWidth: 1080, margin: '0 auto' }}>
      <div className="eyebrow" style={{ marginBottom: 12 }}>PAINEL FORENSE</div>
      <h1 className="page-title" style={{ marginBottom: 8 }}>Bem-vindo{profile?.full_name ? `, ${profile.full_name}` : ''}</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 34, fontSize: 15 }}>Acompanhe seu uso e histórico de análises.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 16, marginBottom: 30 }}>
        {[
          { label: 'Análises este mês', value: `${used} / ${limit === -1 ? '∞' : limit}`, icon: FileText, color: 'var(--brand-gold)' },
          { label: 'Plano atual', value: (plan?.name_pt as string) ?? 'Gratuito', icon: TrendingUp, color: 'var(--brand-gold)' },
          { label: 'Total de análises', value: recent.length >= 10 ? '10+' : String(recent.length), icon: CheckCircle, color: 'var(--status-success)' },
        ].map(s => (
          <div key={s.label} className="metric-card">
            <span className="frame-icon" style={{ width: 38, height: 38, marginBottom: 14 }}><s.icon size={18} color={s.color} /></span>
            <div style={{ fontSize: 26, fontWeight: 700, color: s.color, letterSpacing: '-0.02em' }}>{s.value}</div>
            <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {limit !== -1 && (
        <div className="panel" style={{ padding: 22, marginBottom: 30 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Uso do plano este mês</span>
            <span className="mono" style={{ fontSize: 13, color: 'var(--brand-gold)' }}>{used} / {limit}</span>
          </div>
          <div style={{ background: 'var(--ink-950)', borderRadius: 100, height: 8 }}>
            <div style={{ width: `${usedPct}%`, background: usedPct >= 90 ? 'var(--status-danger)' : 'var(--brand-gold)', height: 8, borderRadius: 100, transition: 'width 0.6s ease' }} />
          </div>
          {usedPct >= 80 && (
            <Link href="/pricing"><p style={{ fontSize: 12, color: 'var(--status-danger)', marginTop: 8 }}>Limite quase atingido. <span style={{ textDecoration: 'underline' }}>Fazer upgrade</span></p></Link>
          )}
        </div>
      )}

      <div style={{ marginBottom: 34 }}>
        <Link href="/analyze">
          <Button className="btn-gold" style={{ padding: '12px 26px', height: 46 }}>
            Nova Análise Forense
          </Button>
        </Link>
      </div>

      <div>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>Análises Recentes</h2>
        {recent.length === 0 ? (
          <div className="frame-card" style={{ padding: '48px 32px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <span className="frame-icon" style={{ width: 48, height: 48, marginBottom: 6 }}><FileText size={22} /></span>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-secondary)' }}>Nenhuma análise ainda</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>Seu histórico forense aparece aqui após a primeira análise.</div>
            <Link href="/analyze"><button className="btn-ghost" style={{ padding: '9px 20px', fontSize: 13 }}>Analisar agora</button></Link>
          </div>
        ) : (
          <div className="panel" style={{ overflow: 'hidden', padding: 0 }}>
            {recent.map((a, i) => (
              <div
                key={a.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 20px',
                  borderBottom: i < recent.length - 1 ? '1px solid var(--ink-900)' : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 8, background: 'var(--ink-950)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 14, fontWeight: 700, color: verdictColor(a.verdict),
                  }}>
                    {a.overall_ai_score}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 600 }}>{a.verdict}</div>
                    <div className="cid" style={{ fontSize: 11, color: 'var(--text-muted)' }}>{a.cid_code}</div>
                  </div>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{formatDate(a.created_at)}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
