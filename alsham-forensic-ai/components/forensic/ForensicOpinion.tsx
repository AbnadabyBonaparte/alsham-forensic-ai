'use client'
import { FileText } from 'lucide-react'

interface ForensicOpinionProps {
  forensicSummary: string
  recommendation: string
}

export function ForensicOpinion({ forensicSummary, recommendation }: ForensicOpinionProps) {
  if (!forensicSummary) return null

  return (
    <div style={{ background: 'var(--ink-950)', borderRadius: 12, padding: 20, border: '1px solid var(--surface-600)' }}>
      <div style={{ fontSize: 10, letterSpacing: 2, color: 'var(--brand-gold)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
        <FileText size={12} />
        LAUDO FORENSE
      </div>
      <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, margin: '0 0 12px', fontStyle: 'italic' }}>
        {forensicSummary}
      </p>
      <div style={{ borderTop: '1px solid var(--surface-600)', paddingTop: 12 }}>
        <div style={{ fontSize: 10, letterSpacing: 2, color: 'var(--text-secondary)', marginBottom: 6 }}>RECOMENDAÇÃO:</div>
        <p style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.6, margin: 0 }}>{recommendation}</p>
      </div>
    </div>
  )
}
