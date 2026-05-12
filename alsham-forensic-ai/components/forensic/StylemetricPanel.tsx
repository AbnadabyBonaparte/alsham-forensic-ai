'use client'
import type { StylemetricResult } from '@/types'

interface StylemetricPanelProps {
  stylometric: StylemetricResult
}

export function StylemetricPanel({ stylometric }: StylemetricPanelProps) {
  const metrics = [
    {
      label: 'Perplexidade',
      value: stylometric.perplexityScore,
      max: 120,
      good: (v: number) => v >= 60,
      format: (v: number) => String(v),
      hint: 'Humano: 60-120 · IA: 10-40',
    },
    {
      label: 'Burstiness',
      value: Math.round(stylometric.burstiScore * 100),
      max: 100,
      good: (v: number) => v >= 50,
      format: (v: number) => `${v}%`,
      hint: 'Alta variância é humana',
    },
    {
      label: 'Riqueza Vocabular',
      value: Math.round(stylometric.vocabularyRichness * 100),
      max: 100,
      good: (v: number) => v >= 60,
      format: (v: number) => `${v}%`,
      hint: 'Diversidade léxica',
    },
    {
      label: 'Comprimento Médio',
      value: Math.round(stylometric.avgSentenceLength),
      max: 40,
      good: (_: number) => true,
      format: (v: number) => `${v} words`,
      hint: 'Palavras por frase',
    },
    {
      label: 'Diversidade Léxica',
      value: Math.round(stylometric.lexicalDiversity * 100),
      max: 100,
      good: (v: number) => v >= 60,
      format: (v: number) => `${v}%`,
      hint: 'Type-token ratio',
    },
  ]

  return (
    <div>
      <div style={{ fontSize: 10, letterSpacing: 2, color: 'var(--brand-gold)', marginBottom: 12 }}>ANÁLISE ESTILOMÉTRICA</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {metrics.map(m => {
          const pct = Math.min((m.value / m.max) * 100, 100)
          const isGood = m.good(m.value)
          return (
            <div key={m.label}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{m.label}</span>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: isGood ? 'var(--status-success)' : 'var(--status-danger)' }}>{m.format(m.value)}</span>
                  <span style={{ fontSize: 10, color: 'var(--text-muted)', marginLeft: 6 }}>{m.hint}</span>
                </div>
              </div>
              <div style={{ background: 'var(--ink-950)', borderRadius: 100, height: 6 }}>
                <div style={{
                  width: `${pct}%`, height: 6, borderRadius: 100,
                  background: isGood ? 'var(--status-success)' : 'var(--status-danger)',
                  transition: 'width 0.8s ease-out',
                }} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
