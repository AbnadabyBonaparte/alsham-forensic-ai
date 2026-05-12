import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateCertificatePDF } from '@/lib/pdf/certificate'
import type { AnalysisResult } from '@/types'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })

  // Check plan allows PDF
  const { data: profile } = await supabase
    .from('profiles')
    .select('*, plans(*)')
    .eq('id', user.id)
    .single()

  const plan = profile?.plans as Record<string, unknown>
  if (!plan?.pdf_reports) {
    return NextResponse.json(
      { error: 'PLAN_UPGRADE_REQUIRED', message: 'Geracão de PDF requer plano Profissional ou superior.' },
      { status: 403 }
    )
  }

  const { analysisId } = await req.json() as { analysisId: string }

  const { data: analysis } = await supabase
    .from('analyses')
    .select('*, institutions(name)')
    .eq('id', analysisId)
    .eq('user_id', user.id)
    .single()

  if (!analysis) {
    return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 })
  }

  const institutionName = (analysis.institutions as Record<string, string> | null)?.name ?? 'N/A'

  const result: AnalysisResult = {
    id: analysis.id,
    overallAiScore: analysis.overall_ai_score,
    verdict: analysis.verdict,
    detectedModel: analysis.detected_model ?? 'Indeterminado',
    confidence: analysis.confidence ?? 0,
    paragraphs: analysis.paragraphs ?? [],
    stylometric: analysis.stylometric ?? { perplexityScore: 0, burstiScore: 0, vocabularyRichness: 0, avgSentenceLength: 0, lexicalDiversity: 0 },
    citations: analysis.citations ?? [],
    flags: analysis.flags ?? [],
    reverseTranslationDetected: analysis.reverse_translation_detected ?? false,
    pasteDetected: analysis.paste_detected ?? false,
    compliance: {
      institution: institutionName,
      verdict: analysis.compliance_verdict ?? 'CONFORME',
      riskLevel: analysis.compliance_risk ?? 'BAIXO',
      violatedNormatives: [],
    },
    forensicSummary: '',
    recommendation: '',
    cidCode: analysis.cid_code ?? '',
    textHash: analysis.text_hash,
    resubmissionData: { isResubmission: false, submissionCount: 0, scoreTrend: 'FIRST_SUBMISSION' },
    createdAt: analysis.created_at,
  }

  const pdfBuffer = await generateCertificatePDF(result, institutionName)

  return new NextResponse(pdfBuffer.buffer as ArrayBuffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="CID-${analysis.cid_code}.pdf"`,
    },
  })
}
