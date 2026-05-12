'use client'
import { ExternalLink, CheckCircle, AlertTriangle, XCircle } from 'lucide-react'
import type { CitationResult } from '@/types'
import { riskColor } from '@/lib/utils'

interface CitationPanelProps {
  citations: CitationResult[]
}

const riskIcon = (risk: string) => {
  if (risk === 'low') return <CheckCircle size={14} color="#16A34A" />
  if (risk === 'medium') return <AlertTriangle size={14} color="#D97706" />
  return <XCircle size={14} color="#DC2626" />
}

const riskLabel: Record<string, string> = {
  low: 'Verificada',
  medium: 'Suspeita',
  critical: 'Fantasma',
}

export function CitationPanel({ citations }: CitationPanelProps) {
  if (!citations?.length) {
    return (
      <div>
        <div style={{ fontSize: 10, letterSpacing: 2, color: '#C9A84C', marginBottom: 12 }}>VERIFICAÇÃO BIBLIOGRÁFICA</div>
        <div style={{ color: '#64748B', fontSize: 13 }}>Nenhuma citação detectada no texto.</div>
      </div>
    )
  }

  return (
    <div>
      <div style={{ fontSize: 10, letterSpacing: 2, color: '#C9A84C', marginBottom: 12 }}>VERIFICAÇÃO BIBLIOGRÁFICA ({citations.length})</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {citations.map((c, i) => (
          <div
            key={i}
            style={{
              background: '#0A0F1E', borderRadius: 8, padding: 14,
              borderLeft: `3px solid ${riskColor(c.risk)}`,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, color: '#F8FAFC', fontWeight: 600 }}>{c.author}</div>
                <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>{c.title}{c.year ? ` (${c.year})` : ''}</div>
                <div style={{ fontSize: 11, color: '#64748B', marginTop: 4, fontStyle: 'italic' }}>{c.full?.slice(0, 100)}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: riskColor(c.risk) }}>
                  {riskIcon(c.risk)}
                  {riskLabel[c.risk] ?? c.risk}
                </div>
                <a
                  href={c.scholarUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 4,
                    fontSize: 11, color: '#C9A84C', textDecoration: 'none',
                  }}
                >
                  Scholar <ExternalLink size={10} />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
