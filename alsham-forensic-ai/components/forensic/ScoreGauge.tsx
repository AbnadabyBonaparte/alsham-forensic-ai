'use client'
import { useEffect, useRef } from 'react'
import { verdictColor, verdictLabel } from '@/lib/utils'

interface ScoreGaugeProps {
  score: number
  verdict: string
  confidence: number
  detectedModel: string
}

export function ScoreGauge({ score, verdict, confidence, detectedModel }: ScoreGaugeProps) {
  const circleRef = useRef<SVGCircleElement>(null)
  const radius = 80
  const circumference = 2 * Math.PI * radius
  const color = verdictColor(verdict)

  useEffect(() => {
    if (!circleRef.current) return
    const offset = circumference - (score / 100) * circumference
    circleRef.current.style.transition = 'stroke-dashoffset 1.4s cubic-bezier(0.4,0,0.2,1)'
    circleRef.current.style.strokeDashoffset = String(offset)
  }, [score, circumference])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
      <div style={{ position: 'relative', width: 220, height: 220 }}>
        <svg width="220" height="220" viewBox="0 0 220 220" style={{ transform: 'rotate(-90deg)' }}>
          {/* Background track */}
          <circle
            cx="110" cy="110" r={radius}
            fill="none" stroke="#1B2A4A" strokeWidth="14"
          />
          {/* Score arc */}
          <circle
            ref={circleRef}
            cx="110" cy="110" r={radius}
            fill="none" stroke={color} strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference}
          />
        </svg>
        {/* Center text */}
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{ fontSize: 52, fontWeight: 800, color, lineHeight: 1 }}>{score}</div>
          <div style={{ fontSize: 10, letterSpacing: 2, color: '#94A3B8', marginTop: 4 }}>SCORE DE IA</div>
        </div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 18, fontWeight: 700, color, marginBottom: 4 }}>{verdictLabel(verdict)}</div>
        <div style={{ fontSize: 13, color: '#94A3B8' }}>Modelo: <span style={{ color: '#F8FAFC' }}>{detectedModel}</span></div>
        <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>Confiança: {(confidence * 100).toFixed(0)}%</div>
      </div>
    </div>
  )
}
