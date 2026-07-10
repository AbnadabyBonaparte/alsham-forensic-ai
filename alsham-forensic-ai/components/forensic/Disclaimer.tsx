import { AlertTriangle } from 'lucide-react'

/**
 * Shared AI accuracy / liability notice.
 * Rendered on the results panel, the CID certificate and the public
 * verification page. Communicates that the score is probabilistic and does
 * not constitute definitive forensic proof.
 */
export function Disclaimer({ compact = false }: { compact?: boolean }) {
  return (
    <div
      role="note"
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 8,
        background: 'var(--surface-700)',
        border: '1px solid var(--border-soft)',
        borderRadius: 10,
        padding: compact ? '10px 12px' : '12px 14px',
        fontSize: compact ? 11 : 12,
        lineHeight: 1.6,
        color: 'var(--text-muted)',
      }}
    >
      <AlertTriangle
        size={compact ? 13 : 14}
        style={{ color: 'var(--brand-gold)', flexShrink: 0, marginTop: 2 }}
      />
      <span>
        Resultado probabilístico gerado por IA. Não substitui revisão humana e
        não constitui prova pericial definitiva. Sujeito a margem de erro e a
        falso-positivo.
      </span>
    </div>
  )
}
