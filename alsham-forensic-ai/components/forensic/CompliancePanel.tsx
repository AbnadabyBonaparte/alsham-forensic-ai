'use client'
import { Shield, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'
import type { ComplianceResult } from '@/types'
import { riskColor } from '@/lib/utils'

interface CompliancePanelProps {
  compliance: ComplianceResult
}

const verdictConfig = {
  CONFORME: { icon: CheckCircle, color: '#16A34A', label: 'Conforme' },
  ALERTA: { icon: AlertTriangle, color: '#D97706', label: 'Alerta' },
  'VIOLAÇÃO': { icon: XCircle, color: '#DC2626', label: 'Violação' },
} as const

export function CompliancePanel({ compliance }: CompliancePanelProps) {
  const config = verdictConfig[compliance.verdict] ?? verdictConfig['ALERTA']
  const Icon = config.icon

  return (
    <div>
      <div style={{ fontSize: 10, letterSpacing: 2, color: '#C9A84C', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
        <Shield size={12} />
        CONFORMIDADE NORMATIVA
      </div>

      {/* Verdict badge */}
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        background: `${config.color}18`, border: `1px solid ${config.color}44`,
        borderRadius: 8, padding: '10px 16px', marginBottom: 16,
      }}>
        <Icon size={18} color={config.color} />
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: config.color }}>{config.label}</div>
          <div style={{ fontSize: 11, color: '#94A3B8' }}>
            Risco: <span style={{ color: riskColor(compliance.riskLevel) }}>{compliance.riskLevel}</span>
            {' · '}{compliance.institution}
          </div>
        </div>
      </div>

      {/* Violated normatives */}
      {compliance.violatedNormatives?.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ fontSize: 11, color: '#64748B', marginBottom: 4 }}>NORMATIVAS VERIFICADAS:</div>
          {compliance.violatedNormatives.map((n, i) => (
            <div
              key={i}
              style={{
                background: '#0A0F1E', borderRadius: 8, padding: 12,
                borderLeft: `3px solid ${n.severity === 'critical' ? '#DC2626' : '#D97706'}`,
              }}
            >
              <div style={{ fontSize: 12, color: '#C9A84C', fontWeight: 600 }}>{n.code} — {n.document}</div>
              <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 4, lineHeight: 1.5 }}>{n.description}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
