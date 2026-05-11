'use client'
import { FileText } from 'lucide-react'

interface ForensicOpinionProps {
  forensicSummary: string
  recommendation: string
}

export function ForensicOpinion({ forensicSummary, recommendation }: ForensicOpinionProps) {
  if (!forensicSummary) return null

  return (
    <div style={{ background: '#0A0F1E', borderRadius: 12, padding: 20, border: '1px solid #1B2A4A' }}>
      <div style={{ fontSize: 10, letterSpacing: 2, color: '#C9A84C', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
        <FileText size={12} />
        LAUDO FORENSE
      </div>
      <p style={{ fontSize: 13, color: '#CBD5E1', lineHeight: 1.7, margin: '0 0 12px', fontStyle: 'italic' }}>
        {forensicSummary}
      </p>
      <div style={{ borderTop: '1px solid #1B2A4A', paddingTop: 12 }}>
        <div style={{ fontSize: 10, letterSpacing: 2, color: '#94A3B8', marginBottom: 6 }}>RECOMENDAÇÃO:</div>
        <p style={{ fontSize: 13, color: '#F8FAFC', lineHeight: 1.6, margin: 0 }}>{recommendation}</p>
      </div>
    </div>
  )
}
