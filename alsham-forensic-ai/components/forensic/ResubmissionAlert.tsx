'use client'
import { AlertTriangle, TrendingDown } from 'lucide-react'

interface ResubmissionAlertProps {
  resubmissionData: {
    isResubmission: boolean
    submissionCount: number
    scoreTrend: string
  }
}

export function ResubmissionAlert({ resubmissionData }: ResubmissionAlertProps) {
  if (!resubmissionData?.isResubmission) return null

  const isBypass = resubmissionData.scoreTrend === 'DECLINING_BYPASS_ATTEMPT'

  return (
    <div style={{
      background: isBypass ? '#7F1D1D18' : '#7C2D1218',
      border: `1px solid ${isBypass ? '#DC2626' : '#D97706'}`,
      borderRadius: 12, padding: 16, display: 'flex', alignItems: 'flex-start', gap: 12,
    }}>
      {isBypass ? <TrendingDown size={20} color="#DC2626" style={{ marginTop: 2 }} /> : <AlertTriangle size={20} color="#D97706" style={{ marginTop: 2 }} />}
      <div>
        <div style={{ fontSize: 14, fontWeight: 700, color: isBypass ? '#DC2626' : '#D97706', marginBottom: 4 }}>
          {isBypass ? '⛔ TENTATIVA DE BURLA DETECTADA' : '⚠️ Texto Resubmetido'}
        </div>
        <div style={{ fontSize: 13, color: '#94A3B8', lineHeight: 1.5 }}>
          {isBypass
            ? `Este texto foi submetido ${resubmissionData.submissionCount} vez(es) anteriormente com score decrescente, indicando tentativa de burlar o sistema. Conforme Art. 36 da Portaria CNPq 2664/2026, a reincidência é circunstância agravante na dosimetria da sanção.`
            : `Este texto já foi analisado ${resubmissionData.submissionCount} vez(es) anteriormente. Histórico registrado para fins de dosimetria.`}
        </div>
      </div>
    </div>
  )
}
