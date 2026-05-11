'use client'
import { Flag } from 'lucide-react'

interface FlagsPanelProps {
  flags: string[]
}

export function FlagsPanel({ flags }: FlagsPanelProps) {
  if (!flags?.length) return null

  return (
    <div>
      <div style={{ fontSize: 10, letterSpacing: 2, color: '#C9A84C', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
        <Flag size={12} />
        FLAGS FORENSES DETECTADAS
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {flags.map((flag, i) => (
          <span
            key={i}
            style={{
              background: '#1B2A4A', border: '1px solid #2D3A56',
              color: '#CBD5E1', fontSize: 12, padding: '5px 12px',
              borderRadius: 100,
            }}
          >
            {flag}
          </span>
        ))}
      </div>
    </div>
  )
}
