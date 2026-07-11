'use client'
import { useState, useCallback } from 'react'
import { Loader2, Search, AlertCircle, FileText, Shield } from 'lucide-react'
import { ResultPanel } from './ResultPanel'
import { verdictColor, verdictLabel, formatDate } from '@/lib/utils'
import { NormativeShield, CidSeal, RiskEscalation } from '@/components/icons'
import type { AnalysisResult } from '@/types'

interface RecentAnalysis {
  id: string
  overall_ai_score: number
  verdict: string
  created_at: string
  cid_code: string | null
}

interface Props {
  recentAnalyses: RecentAnalysis[]
  analysesUsed: number
  analysesLimit: number
  maxChars: number
  hasPdfAccess: boolean
  planName: string
}

const INSTITUTIONS = [
  { id: 'cnpq',     name: 'CNPq', country: 'BR', full: 'CNPq — Conselho Nacional de Desenvolvimento Científico e Tecnológico' },
  { id: 'ufpb',     name: 'UFPB', country: 'BR', full: 'Universidade Federal da Paraíba' },
  { id: 'usp',      name: 'USP',  country: 'BR', full: 'Universidade de São Paulo' },
  { id: 'unicamp',  name: 'UNICAMP', country: 'BR', full: 'Universidade Estadual de Campinas' },
  { id: 'ufmg',     name: 'UFMG', country: 'BR', full: 'Universidade Federal de Minas Gerais' },
  { id: 'puc_rio',  name: 'PUC-Rio', country: 'BR', full: 'PUC-Rio' },
  { id: 'coimbra',  name: 'Coimbra', country: 'PT', full: 'Universidade de Coimbra' },
  { id: 'mit',      name: 'MIT', country: 'US', full: 'Massachusetts Institute of Technology' },
  { id: 'harvard',  name: 'Harvard', country: 'US', full: 'Harvard University' },
  { id: 'oxford',   name: 'Oxford', country: 'GB', full: 'University of Oxford' },
  { id: 'unesco',   name: 'UNESCO', country: 'XX', full: 'UNESCO / AI Act EU' },
]

const STEPS = [
  'Calculando hash SHA-256…',
  'Verificando histórico de resubmissões…',
  'Analisando com Claude claude-sonnet-4…',
  'Calibrando com GPT-4o-mini…',
  'Verificando citações bibliográficas…',
]

export function AnalyzeForm({ recentAnalyses, analysesUsed, analysesLimit, maxChars, hasPdfAccess, planName }: Props) {
  const [text, setText]               = useState('')
  const [institutionId, setInstitutionId] = useState('cnpq')
  const [pasteDetected, setPasteDetected] = useState(false)
  const [pasteCharCount, setPasteCharCount] = useState(0)
  const [loading, setLoading]         = useState(false)
  const [step, setStep]               = useState(0)
  const [error, setError]             = useState('')
  const [paywall, setPaywall]         = useState(false)
  const [result, setResult]           = useState<AnalysisResult | null>(null)

  const usedPct = analysesLimit === -1 ? 0 : Math.min((analysesUsed / analysesLimit) * 100, 100)
  const atLimit  = analysesLimit !== -1 && analysesUsed >= analysesLimit

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text')
    if (pasted.length > 50) {
      setPasteDetected(true)
      setPasteCharCount(prev => prev + pasted.length)
    }
  }, [])

  async function handleAnalyze(e: React.FormEvent) {
    e.preventDefault()
    if (text.length < 80 || atLimit) return
    setError('')
    setPaywall(false)
    setLoading(true)
    setResult(null)
    setStep(0)

    const iv = setInterval(() => setStep(p => p < STEPS.length - 1 ? p + 1 : p), 3500)

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, institutionId, pasteDetected, pasteCharCount }),
      })
      const data = await res.json() as AnalysisResult & { error?: string; message?: string }
      if (!res.ok) {
        // Anonymous free-tier exhausted (402) or plan quota reached — surface an upgrade CTA.
        if (res.status === 402 || data.error === 'ANON_LIMIT_REACHED' || data.error === 'QUOTA_EXCEEDED') {
          setPaywall(true)
        }
        setError(data.message ?? data.error ?? 'Erro na análise')
        return
      }
      setResult(data)
    } catch {
      setError('Erro de conexão. Tente novamente.')
    } finally {
      clearInterval(iv)
      setLoading(false)
    }
  }

  return (
    <div className="analyze-grid">

      {/* ─── LEFT: INPUT ─── */}
      <div className="analyze-left-col analyze-col" style={{
        padding: '24px 20px', overflowY: 'auto',
        position: 'sticky', top: 0, maxHeight: '100vh',
      }}>
        <div style={{ fontSize: 10, letterSpacing: '0.15em', color: 'var(--brand-gold)', fontFamily: 'var(--font-mono)', marginBottom: 20 }}>ANÁLISE FORENSE</div>

        <form onSubmit={handleAnalyze} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Institution */}
          <div>
            <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 6, letterSpacing: '0.08em' }}>INSTITUIÇÃO</label>
            <select
              value={institutionId}
              onChange={e => setInstitutionId(e.target.value)}
              style={{
                width: '100%', background: 'var(--ink-950)', color: 'var(--text-primary)',
                border: '1px solid var(--border-strong)', borderRadius: 10,
                padding: '9px 12px', fontSize: 13, outline: 'none',
              }}
            >
              {INSTITUTIONS.map(i => (
                <option key={i.id} value={i.id}>[{i.country}] {i.name} — {i.full}</option>
              ))}
            </select>
          </div>

          {/* Textarea */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <label style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.08em' }}>TEXTO ACADÊMICO</label>
              <span className="mono" style={{ fontSize: 11, color: text.length < 80 && text.length > 0 ? 'var(--status-danger)' : 'var(--text-muted)' }}>
                {text.length.toLocaleString()}/{maxChars.toLocaleString()}
              </span>
            </div>
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              onPaste={handlePaste}
              placeholder="Cole o texto acadêmico aqui..."
              style={{
                width: '100%', minHeight: 220,
                background: 'var(--ink-950)', color: 'var(--text-primary)',
                border: `1px solid ${text.length < 80 && text.length > 0 ? 'var(--status-danger)' : 'var(--border-strong)'}`,
                borderRadius: 12, padding: 14, fontSize: 13,
                boxSizing: 'border-box', resize: 'vertical', outline: 'none',
                fontFamily: 'var(--font-inter)', lineHeight: 1.65,
              }}
            />
            {pasteDetected && (
              <div style={{ fontSize: 11, color: 'var(--status-warning)', marginTop: 6 }}>
                ⚠ Cole-e-cola detectado ({pasteCharCount.toLocaleString()} chars) — registrado.
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <div style={{
              background: 'var(--surface-danger)', border: '1px solid rgba(225,84,84,0.3)',
              borderRadius: 10, padding: '10px 14px',
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <AlertCircle size={14} style={{ color: 'var(--status-danger)', flexShrink: 0 }} />
              <span style={{ fontSize: 13, color: 'var(--status-danger)' }}>{error}</span>
            </div>
          )}

          {/* Paywall CTA — shown when the free/plan limit is reached */}
          {paywall && (
            <div style={{
              background: 'var(--surface-700)',
              border: '1px solid color-mix(in srgb, var(--brand-gold) 40%, transparent)',
              borderRadius: 12, padding: '16px 16px',
              display: 'flex', flexDirection: 'column', gap: 10,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <CidSeal size={16} style={{ color: 'var(--brand-gold)' }} />
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                  Você atingiu o limite gratuito
                </span>
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
                Crie uma conta gratuita ou faça upgrade para continuar analisando textos com laudo completo e certificado CID.
              </p>
              <div style={{ display: 'flex', gap: 8 }}>
                <a href="/signup" style={{ flex: 1 }}>
                  <button type="button" style={{
                    width: '100%', background: 'var(--brand-gold)', color: 'var(--ink-950)',
                    border: 'none', borderRadius: 8, padding: '9px 0', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                  }}>Criar conta grátis</button>
                </a>
                <a href="/pricing" style={{ flex: 1 }}>
                  <button type="button" style={{
                    width: '100%', background: 'transparent', color: 'var(--brand-gold)',
                    border: '1px solid color-mix(in srgb, var(--brand-gold) 40%, transparent)',
                    borderRadius: 8, padding: '9px 0', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  }}>Ver planos</button>
                </a>
              </div>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || text.length < 80 || atLimit}
            style={{
              background: loading || text.length < 80 || atLimit ? 'var(--surface-700)' : 'var(--brand-gold)',
              color: loading || text.length < 80 || atLimit ? 'var(--text-muted)' : 'var(--ink-950)',
              fontWeight: 700, fontSize: 14, padding: '12px 0',
              borderRadius: 10, border: 'none', cursor: loading || text.length < 80 || atLimit ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%',
            }}
          >
            {loading
              ? <><Loader2 size={15} className="animate-spin" /> {STEPS[step]}</>
              : <><Search size={15} /> Analisar texto</>}
          </button>
        </form>

        {/* Plan usage */}
        <div style={{ marginTop: 24, padding: 16, background: 'var(--surface-800)', borderRadius: 12, border: '1px solid var(--border-soft)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{planName}</span>
            <span className="mono" style={{ fontSize: 11, color: 'var(--brand-gold)' }}>
              {analysesUsed}/{analysesLimit === -1 ? '∞' : analysesLimit}
            </span>
          </div>
          {analysesLimit !== -1 && (
            <div style={{ background: 'var(--ink-950)', borderRadius: 999, height: 5 }}>
              <div style={{
                width: `${usedPct}%`, height: 5, borderRadius: 999,
                background: usedPct >= 90 ? 'var(--status-danger)' : 'var(--brand-gold)',
                transition: 'width 0.6s ease',
              }} />
            </div>
          )}
          {atLimit && (
            <a href="/pricing" style={{ display: 'block', marginTop: 8, fontSize: 11, color: 'var(--status-danger)' }}>
              Limite atingido — Fazer upgrade →
            </a>
          )}
        </div>
      </div>

      {/* ─── CENTER: RESULTS ─── */}
      <div style={{ padding: '24px', overflowY: 'auto', borderRight: '1px solid var(--border-soft)' }}>
        {!loading && !result && (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            minHeight: 400, gap: 12, color: 'var(--text-muted)',
          }}>
            <NormativeShield size={48} style={{ color: 'var(--border-strong)', opacity: 0.5 }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Pronto para análise forense</div>
              <div style={{ fontSize: 13 }}>Cole um texto no painel esquerdo e clique em Analisar.</div>
            </div>
          </div>
        )}

        {loading && (
          <div style={{ padding: 24 }}>
            <div style={{ fontSize: 10, letterSpacing: '0.15em', color: 'var(--brand-gold)', fontFamily: 'var(--font-mono)', marginBottom: 20 }}>ANÁLISE EM PROGRESSO</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {STEPS.map((s, i) => (
                <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 10, opacity: i <= step ? 1 : 0.3, transition: 'opacity 0.3s' }}>
                  {i < step
                    ? <span style={{ color: 'var(--status-success)', fontSize: 14 }}>✓</span>
                    : i === step
                      ? <Loader2 size={14} className="animate-spin" style={{ color: 'var(--brand-gold)' }} />
                      : <span style={{ width: 14, height: 14, borderRadius: '50%', background: 'var(--border-strong)', display: 'inline-block' }} />
                  }
                  <span style={{ fontSize: 13, color: i <= step ? 'var(--text-primary)' : 'var(--text-muted)' }}>{s}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {result && !loading && (
          <div className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: 10, letterSpacing: '0.15em', color: 'var(--status-success)', fontFamily: 'var(--font-mono)' }}>ANÁLISE CONCLUÍDA</div>
              <button onClick={() => setResult(null)} style={{ background: 'none', border: 'none', color: 'var(--brand-gold)', cursor: 'pointer', fontSize: 12 }}>Nova análise</button>
            </div>
            <ResultPanel result={result} hasPdfAccess={hasPdfAccess} />
          </div>
        )}
      </div>

      {/* ─── RIGHT: HISTORY ─── */}
      <div className="analyze-right-col" style={{ padding: '24px 16px', overflowY: 'auto' }}>
        <div style={{ fontSize: 10, letterSpacing: '0.15em', color: 'var(--brand-gold)', fontFamily: 'var(--font-mono)', marginBottom: 16 }}>HISTÓRICO</div>

        {recentAnalyses.length === 0 ? (
          <div style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', marginTop: 32 }}>Nenhuma análise ainda.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {recentAnalyses.map(a => (
              <div key={a.id} style={{
                background: 'var(--surface-800)', borderRadius: 10,
                padding: '10px 12px', border: '1px solid var(--border-soft)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: verdictColor(a.verdict) }}>
                    {a.overall_ai_score} · {verdictLabel(a.verdict)}
                  </span>
                </div>
                {a.cid_code && (
                  <a
                    href={`/verify/${a.cid_code}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mono"
                    style={{ fontSize: 10, color: 'var(--brand-gold)', textDecoration: 'none', display: 'block', marginBottom: 3 }}
                  >{a.cid_code}</a>
                )}
                <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{formatDate(a.created_at)}</div>
              </div>
            ))}
          </div>
        )}

        {/* Upgrade CTA if on free plan */}
        <div style={{ marginTop: 24, padding: 16, background: 'var(--surface-700)', borderRadius: 12, border: '1px solid var(--border-soft)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <CidSeal size={16} style={{ color: 'var(--brand-gold)' }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>Plano Profissional</span>
          </div>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 10 }}>
            150 análises, certificado PDF, priority queue.
          </p>
          <a href="/pricing">
            <button style={{
              width: '100%', background: 'transparent',
              color: 'var(--brand-gold)',
              border: '1px solid color-mix(in srgb, var(--brand-gold) 40%, transparent)',
              borderRadius: 8, padding: '7px 0', fontSize: 12, fontWeight: 600, cursor: 'pointer',
            }}>Ver planos</button>
          </a>
        </div>
      </div>
    </div>
  )
}
