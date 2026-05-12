import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { FileText, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'

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

  const verdictColors: Record<string, string> = {
    HUMAN: '#16A34A', SUSPICIOUS: '#D97706', AI_GENERATED: '#DC2626', DEFINITIVE_AI: '#7F1D1D',
  }

  return (
    <div>
      <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 8 }}>Painel</h1>
      <p style={{ color: '#94A3B8', marginBottom: 32 }}>Bem-vindo, {profile?.full_name ?? user?.email}</p>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
        {[
          { label: 'Análises este mês', value: `${used} / ${limit === -1 ? '∞' : limit}`, icon: FileText, color: '#C9A84C' },
          { label: 'Plano atual', value: (plan?.name_pt as string) ?? 'Gratuito', icon: TrendingUp, color: '#C9A84C' },
          { label: 'Total de análises', value: recent.length >= 10 ? '10+' : String(recent.length), icon: CheckCircle, color: '#16A34A' },
        ].map(s => (
          <div key={s.label} style={{ background: '#1B2A4A', borderRadius: 12, padding: 20, border: '1px solid #2D3A56' }}>
            <s.icon size={20} color={s.color} style={{ marginBottom: 10 }} />
            <div style={{ fontSize: 24, fontWeight: 700, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Usage bar */}
      {limit !== -1 && (
        <div style={{ background: '#1B2A4A', borderRadius: 12, padding: 20, marginBottom: 32, border: '1px solid #2D3A56' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 13, color: '#94A3B8' }}>Uso do plano este mês</span>
            <span style={{ fontSize: 13, color: '#C9A84C' }}>{used} / {limit}</span>
          </div>
          <div style={{ background: '#0A0F1E', borderRadius: 100, height: 8 }}>
            <div style={{ width: `${usedPct}%`, background: usedPct >= 90 ? '#DC2626' : '#C9A84C', height: 8, borderRadius: 100, transition: 'width 0.6s ease' }} />
          </div>
          {usedPct >= 80 && (
            <Link href="/pricing"><p style={{ fontSize: 12, color: '#DC2626', marginTop: 8 }}>Limite quase atingido. <span style={{ textDecoration: 'underline' }}>Fazer upgrade</span></p></Link>
          )}
        </div>
      )}

      {/* Quick action */}
      <div style={{ marginBottom: 32 }}>
        <Link href="/analyze">
          <Button style={{ background: '#C9A84C', color: '#0A0F1E', fontWeight: 700, padding: '12px 24px' }}>
            Nova Análise Forense
          </Button>
        </Link>
      </div>

      {/* Recent analyses */}
      <div>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Análises Recentes</h2>
        {recent.length === 0 ? (
          <div style={{ background: '#1B2A4A', borderRadius: 12, padding: 40, textAlign: 'center', color: '#64748B' }}>
            Nenhuma análise ainda. <Link href="/analyze" style={{ color: '#C9A84C' }}>Analisar agora</Link>
          </div>
        ) : (
          <div style={{ background: '#1B2A4A', borderRadius: 12, overflow: 'hidden', border: '1px solid #2D3A56' }}>
            {recent.map((a, i) => (
              <div
                key={a.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 20px',
                  borderBottom: i < recent.length - 1 ? '1px solid #0F1A2E' : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 8, background: '#0A0F1E',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 14, fontWeight: 700, color: verdictColors[a.verdict] ?? '#94A3B8',
                  }}>
                    {a.overall_ai_score}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, color: '#F8FAFC', fontWeight: 600 }}>{a.verdict}</div>
                    <div style={{ fontSize: 11, color: '#64748B' }}>{a.cid_code}</div>
                  </div>
                </div>
                <div style={{ fontSize: 12, color: '#64748B' }}>{formatDate(a.created_at)}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
