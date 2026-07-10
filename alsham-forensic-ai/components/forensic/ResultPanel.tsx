'use client'
import type { AnalysisResult } from '@/types'
import { ScoreGauge } from './ScoreGauge'
import { ParagraphHeatmap } from './ParagraphHeatmap'
import { StylemetricPanel } from './StylemetricPanel'
import { CitationPanel } from './CitationPanel'
import { FlagsPanel } from './FlagsPanel'
import { CompliancePanel } from './CompliancePanel'
import { CIDCertificate } from './CIDCertificate'
import { ResubmissionAlert } from './ResubmissionAlert'
import { ForensicOpinion } from './ForensicOpinion'
import { Disclaimer } from './Disclaimer'

interface ResultPanelProps {
  result: AnalysisResult
  hasPdfAccess: boolean
}

const Section = ({ children }: { children: React.ReactNode }) => (
  <div style={{
    background: 'var(--surface-600)', borderRadius: 12, padding: 24,
    border: '1px solid var(--border-strong)', animation: 'fade-in 0.4s ease-out',
  }}>
    {children}
  </div>
)

export function ResultPanel({ result, hasPdfAccess }: ResultPanelProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {result.pasteDetected && (
        <div style={{
          background: 'var(--surface-warning)', border: '1px solid var(--status-warning)',
          borderRadius: 12, padding: 14, fontSize: 13, color: 'var(--status-warning)',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          ⚠️ Comportamento de cole-e-cola detectado. O texto foi colado em bloco, o que é registrado para fins de dosimetria.
        </div>
      )}

      {result.resubmissionData?.isResubmission && (
        <ResubmissionAlert resubmissionData={result.resubmissionData} />
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 16 }}>
        <Section>
          <ScoreGauge
            score={result.overallAiScore}
            verdict={result.verdict}
            confidence={result.confidence}
            detectedModel={result.detectedModel}
          />
        </Section>
        <Section>
          <CIDCertificate
            cidCode={result.cidCode}
            textHash={result.textHash}
            analysisId={result.id}
            hasPdfAccess={hasPdfAccess}
          />
        </Section>
      </div>

      {result.forensicSummary && (
        <ForensicOpinion
          forensicSummary={result.forensicSummary}
          recommendation={result.recommendation}
        />
      )}

      {result.compliance && (
        <Section>
          <CompliancePanel compliance={result.compliance} />
        </Section>
      )}

      {result.flags?.length > 0 && (
        <Section>
          <FlagsPanel flags={result.flags} />
        </Section>
      )}

      {result.paragraphs?.length > 0 && (
        <Section>
          <ParagraphHeatmap paragraphs={result.paragraphs} />
        </Section>
      )}

      {result.stylometric && (
        <Section>
          <StylemetricPanel stylometric={result.stylometric} />
        </Section>
      )}

      {result.citations !== undefined && (
        <Section>
          <CitationPanel citations={result.citations} />
        </Section>
      )}

      <Disclaimer />
    </div>
  )
}
