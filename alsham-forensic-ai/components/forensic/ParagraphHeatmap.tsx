'use client'
import { riskColor } from '@/lib/utils'
import type { ParagraphResult } from '@/types'

interface ParagraphHeatmapProps {
  paragraphs: ParagraphResult[]
}

export function ParagraphHeatmap({ paragraphs }: ParagraphHeatmapProps) {
  if (!paragraphs?.length) return null

  return (
    <div>
      <div style={{ fontSize: 10, letterSpacing: 2, color: '#C9A84C', marginBottom: 12 }}>MAPA DE CALOR — PARÁGRAFO A PARÁGRAFO</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {paragraphs.map((p, i) => (
          <div key={i} style={{ background: '#0A0F1E', borderRadius: 8, padding: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, alignItems: 'flex-start', gap: 12 }}>
              <p style={{ fontSize: 12, color: '#CBD5E1', lineHeight: 1.5, margin: 0, flex: 1 }}>
                {p.text?.slice(0, 120)}{p.text?.length > 120 ? '...' : ''}
              </p>
              <div style={{
                fontSize: 14, fontWeight: 700,
                color: riskColor(p.aiScore >= 70 ? 'ALTO' : p.aiScore >= 40 ? 'MÉDIO' : 'BAIXO'),
                minWidth: 36, textAlign: 'right',
              }}>
                {p.aiScore}
              </div>
            </div>
            {/* Progress bar */}
            <div style={{ background: '#1B2A4A', borderRadius: 100, height: 5 }}>
              <div style={{
                width: `${p.aiScore}%`,
                background: riskColor(p.aiScore >= 70 ? 'ALTO' : p.aiScore >= 40 ? 'MÉDIO' : 'BAIXO'),
                height: 5, borderRadius: 100,
                transition: 'width 0.8s ease-out',
              }} />
            </div>
            {/* Flags */}
            {p.flags?.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 8 }}>
                {p.flags.slice(0, 4).map(flag => (
                  <span
                    key={flag}
                    style={{
                      fontSize: 10, background: '#1B2A4A', color: '#94A3B8',
                      padding: '2px 8px', borderRadius: 100,
                    }}
                  >{flag}</span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
