'use client'
import { Shield, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'
import type { ComplianceResult } from '@/types'
import { riskColor } from '@/lib/utils'

interface CompliancePanelProps {
  compliance: ComplianceResult
}

const verdictConfig = {
  CONFORME: { icon: CheckCircle, color: 'var(--status-success)', bg: 'var(--surface-success)', border: 'rgba(24,178,107,0.27)', label: 'Conforme' },
  ALERTA: { icon: AlertTriangle, color: 'var(--status-warning)', bg: 'var(--surface-warning)', border: 'rgba(215,155,47,0.27)', label: 'Alerta' },
  'VIOLAÇÃO': { icon: XCircle, color: 'var(--status-danger)', bg: 'var(--surface-danger)', border: 'rgba(225,84,84,0.27)', label: 'Violação' },
} as const

export function CompliancePanel({ compliance }: CompliancePanelProps) {
  const config = verdictConfig[compliance.verdict] ?? verdictConfig['ALERTA']
  const Icon = config.icon

  return (
    <div>
      <div style={{ fontSize: 10, letterSpacing: 2, color: 'var(--brand-gold)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
        <Shield size={12} />
        CONFORMIDADE NORMATIVA
      </div>

      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        background: config.bg, border: `1px solid ${config.border}`,
        borderRadius: 8, padding: '10px 16px', marginBottom: 16,
      }}>
        <Icon size={18} color={config.color} />
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: config.color }}>{config.label}</div>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
            Risco: <span style={{ color: riskColor(compliance.riskLevel) }}>{compliance.riskLevel}</span>
            {' · '}{compliance.institution}
          </div>
        </div>
      </div>

      {compliance.violatedNormatives?.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>NORMATIVAS VERIFICADAS:</div>
          {compliance.violatedNormatives.map((n, i) => (
            <div
              key={i}
              style={{
                background: 'var(--ink-950)', borderRadius: 8, padding: 12,
                borderLeft: `3px solid ${n.severity === 'critical' ? 'var(--status-danger)' : 'var(--status-warning)'}`,
              }}
            >
              <div className="normative-code" style={{ fontSize: 12, color: 'var(--brand-gold)', fontWeight: 600 }}>{n.code} — {n.document}</div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4, lineHeight: 1.5 }}>{n.description}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
