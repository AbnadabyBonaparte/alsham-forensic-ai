'use client'
import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { AlertCircle, Loader2, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ResultPanel } from './ResultPanel'
import type { AnalysisResult } from '@/types'

interface Institution {
  id: string
  name: string
  name_short: string
  country: string
}

const LOADING_STEPS = [
  'Calculando hash SHA-256...',
  'Verificando histórico de resubmissões...',
  'Analisando com Claude claude-sonnet-4...',
  'Calibrando com GPT-4o-mini...',
  'Verificando citações bibliográficas...',
]

export function AnalyzeForm() {
  const searchParams = useSearchParams()
  const [text, setText] = useState(searchParams.get('demo') ?? '')
  const [institutionId, setInstitutionId] = useState('cnpq')
  const [institutions, setInstitutions] = useState<Institution[]>([])
  const [pasteDetected, setPasteDetected] = useState(false)
  const [pasteCharCount, setPasteCharCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [loadingStep, setLoadingStep] = useState(0)
  const [error, setError] = useState('')
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [hasPdfAccess, setHasPdfAccess] = useState(false)

  useEffect(() => {
    fetch('/api/institutions').catch(() => null)
    // Inline institutions fetch for now (avoids extra API route)
    setInstitutions([
      { id: 'cnpq', name: 'CNPq — Conselho Nacional de Desenvolvimento Científico e Tecnológico', name_short: 'CNPq', country: 'BR' },
      { id: 'ufpb', name: 'Universidade Federal da Paraíba', name_short: 'UFPB', country: 'BR' },
      { id: 'usp', name: 'Universidade de São Paulo', name_short: 'USP', country: 'BR' },
      { id: 'unicamp', name: 'Universidade Estadual de Campinas', name_short: 'UNICAMP', country: 'BR' },
      { id: 'ufmg', name: 'Universidade Federal de Minas Gerais', name_short: 'UFMG', country: 'BR' },
      { id: 'puc_rio', name: 'PUC-Rio', name_short: 'PUC-Rio', country: 'BR' },
      { id: 'coimbra', name: 'Universidade de Coimbra', name_short: 'Coimbra', country: 'PT' },
      { id: 'mit', name: 'Massachusetts Institute of Technology', name_short: 'MIT', country: 'US' },
      { id: 'harvard', name: 'Harvard University', name_short: 'Harvard', country: 'US' },
      { id: 'oxford', name: 'University of Oxford', name_short: 'Oxford', country: 'GB' },
      { id: 'unesco', name: 'UNESCO / AI Act EU', name_short: 'UNESCO', country: 'XX' },
    ])

    // Check PDF access
    fetch('/api/analyze', { method: 'HEAD' }).catch(() => null)
    const checkPlan = async () => {
      try {
        const res = await fetch('/api/user/plan')
        if (res.ok) {
          const data = await res.json() as { pdfReports?: boolean }
          setHasPdfAccess(data.pdfReports ?? false)
        }
      } catch { /* anonymous user */ }
    }
    checkPlan()
  }, [])

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text')
    if (pasted.length > 50) {
      setPasteDetected(true)
      setPasteCharCount(prev => prev + pasted.length)
    }
  }, [])

  async function handleAnalyze(e: React.FormEvent) {
    e.preventDefault()
    if (text.length < 80) { setError('Texto muito curto. Mínimo 80 caracteres.'); return }
    setError('')
    setLoading(true)
    setResult(null)
    setLoadingStep(0)

    const stepInterval = setInterval(() => {
      setLoadingStep(prev => (prev < LOADING_STEPS.length - 1 ? prev + 1 : prev))
    }, 3500)

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, institutionId, pasteDetected, pasteCharCount }),
      })

      const data = await res.json() as AnalysisResult & { error?: string; message?: string }

      if (!res.ok) {
        setError(data.message ?? data.error ?? 'Erro na análise')
        return
      }

      setResult(data)
    } catch {
      setError('Erro de conexão. Tente novamente.')
    } finally {
      clearInterval(stepInterval)
      setLoading(false)
    }
  }

  return (
    <div>
      <form onSubmit={handleAnalyze}>
        <div style={{ background: '#1B2A4A', borderRadius: 16, padding: 24, marginBottom: 16, border: '1px solid #2D3A56' }}>
          {/* Institution selector */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, color: '#94A3B8', display: 'block', marginBottom: 6 }}>INSTITUIÇÃO</label>
            <select
              value={institutionId}
              onChange={e => setInstitutionId(e.target.value)}
              style={{
                width: '100%', background: '#0A0F1E', color: '#F8FAFC',
                border: '1px solid #2D3A56', borderRadius: 8, padding: '10px 12px',
                fontSize: 14, outline: 'none', cursor: 'pointer',
              }}
            >
              {institutions.map(inst => (
                <option key={inst.id} value={inst.id}>
                  [{inst.country}] {inst.name_short} — {inst.name}
                </option>
              ))}
            </select>
          </div>

          {/* Text area */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <label style={{ fontSize: 12, color: '#94A3B8' }}>TEXTO ACADÊMICO</label>
              <span style={{ fontSize: 12, color: text.length < 80 ? '#DC2626' : '#64748B' }}>
                {text.length} / 50.000 caracteres
              </span>
            </div>
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              onPaste={handlePaste}
              placeholder="Cole o texto acadêmico aqui. Mínimo 80 caracteres. Suporta português, inglês e espanhol."
              style={{
                width: '100%', minHeight: 240, background: '#0A0F1E', color: '#F8FAFC',
                border: `1px solid ${text.length < 80 && text.length > 0 ? '#DC2626' : '#2D3A56'}`,
                borderRadius: 8, padding: 14, fontSize: 14, boxSizing: 'border-box',
                resize: 'vertical', outline: 'none', fontFamily: 'inherit', lineHeight: 1.6,
              }}
            />
          </div>

          {/* Paste detection badge */}
          {pasteDetected && (
            <div style={{ marginTop: 8, fontSize: 11, color: '#D97706', display: 'flex', alignItems: 'center', gap: 4 }}>
              ⚠️ Comportamento de cole-e-cola detectado ({pasteCharCount} chars colados) — registrado para dosimetria.
            </div>
          )}

          {/* Error */}
          {error && (
            <div style={{ marginTop: 12, background: '#7F1D1D18', border: '1px solid #DC2626', borderRadius: 8, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertCircle size={14} color="#DC2626" />
              <span style={{ fontSize: 13, color: '#FCA5A5' }}>{error}</span>
            </div>
          )}

          {/* Submit */}
          <Button
            type="submit"
            disabled={loading || text.length < 80}
            style={{
              width: '100%', marginTop: 16,
              background: loading || text.length < 80 ? '#2D3A56' : '#C9A84C',
              color: loading || text.length < 80 ? '#64748B' : '#0A0F1E',
              fontWeight: 700, fontSize: 15, padding: '12px 0',
            }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                {LOADING_STEPS[loadingStep]}
              </span>
            ) : (
              <span style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                <Search size={16} />
                Analisar Texto
              </span>
            )}
          </Button>
        </div>
      </form>

      {/* Loading state */}
      {loading && (
        <div style={{ background: '#1B2A4A', borderRadius: 12, padding: 24, marginBottom: 16, border: '1px solid #2D3A56' }}>
          <div style={{ fontSize: 12, color: '#94A3B8', marginBottom: 16, textAlign: 'center' }}>ANÁLISE EM PROGRESSO</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {LOADING_STEPS.map((step, i) => (
              <div
                key={step}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  opacity: i <= loadingStep ? 1 : 0.3,
                  transition: 'opacity 0.3s',
                }}
              >
                {i < loadingStep ? (
                  <span style={{ color: '#16A34A', fontSize: 14 }}>✓</span>
                ) : i === loadingStep ? (
                  <Loader2 size={14} color="#C9A84C" style={{ animation: 'spin 1s linear infinite' }} />
                ) : (
                  <span style={{ width: 14, height: 14, borderRadius: '50%', background: '#2D3A56', display: 'inline-block' }} />
                )}
                <span style={{ fontSize: 13, color: i <= loadingStep ? '#F8FAFC' : '#64748B' }}>{step}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Result */}
      {result && !loading && (
        <div style={{ animation: 'fade-in 0.4s ease-out' }}>
          <div style={{ fontSize: 12, color: '#94A3B8', marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
            <span>ANÁLISE CONCLUÍDA</span>
            <button
              onClick={() => setResult(null)}
              style={{ background: 'none', border: 'none', color: '#C9A84C', cursor: 'pointer', fontSize: 12 }}
            >
              Nova análise
            </button>
          </div>
          <ResultPanel result={result} hasPdfAccess={hasPdfAccess} />
        </div>
      )}
    </div>
  )
}
