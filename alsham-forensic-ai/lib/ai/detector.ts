import Anthropic from '@anthropic-ai/sdk'
import OpenAI from 'openai'
import type { AnalysisRequest, AnalysisResult } from '@/types'
import { getInstitutionNormatives } from '@/lib/institutions/normatives'
import { verifyCitations } from './citation-verifier'
import { generateCID, hashText } from './crypto'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const FORENSIC_SYSTEM_PROMPT = (institutionName: string, normatives: string) => `
You are ALSHAM Forensic AI v1.0 — an elite forensic linguistic analysis engine used by doctoral review boards and Brazilian federal agencies (CNPq, CAPES) to assess academic text integrity.

INSTITUTION UNDER REVIEW: ${institutionName}
APPLICABLE NORMATIVES:
${normatives}

Analyze with maximum forensic precision. GPT-4 fingerprint: transitional phrase overuse, balanced triadic structures, hedging symmetry. Claude fingerprint: em-dash overuse, nuanced epistemic hedging, metacognitive qualifiers. Gemini fingerprint: parallel list structures, adjective repetition. Llama: inconsistent register.

Burstiness: human writing has HIGH variance in sentence length. AI writing has LOW variance (0.0-0.3).
Perplexity: human text scores 60-120. AI text scores 10-40.

RETURN ONLY VALID JSON — no markdown, no explanation:
{
  "overall_ai_score": <integer 0-100>,
  "verdict": <"HUMAN"|"SUSPICIOUS"|"AI_GENERATED"|"DEFINITIVE_AI">,
  "detected_model": <"Human"|"GPT-4"|"Claude"|"Gemini"|"Llama"|"Híbrido"|"Indeterminado">,
  "confidence": <float 0.00-1.00>,
  "paragraphs": [{"text": <first 90 chars>, "ai_score": <0-100>, "flags": [<specific strings>]}],
  "stylometric": {
    "perplexity_score": <integer 10-120>,
    "burstiness_score": <float 0.00-1.00>,
    "vocabulary_richness": <float 0.00-1.00>,
    "avg_sentence_length": <float>,
    "lexical_diversity": <float 0.00-1.00>
  },
  "citations": [{"author": <str>, "title": <str>, "year": <str|null>, "full": <as written>, "exists": <bool>, "risk": <"low"|"medium"|"critical">}],
  "reverse_translation_detected": <bool>,
  "flags": [<2-8 specific forensic flags>],
  "compliance_verdict": <"CONFORME"|"ALERTA"|"VIOLAÇÃO">,
  "compliance_risk": <"BAIXO"|"MÉDIO"|"ALTO"|"CRÍTICO">,
  "forensic_summary": <2-3 sentences in pt-BR, legally-worded>,
  "recommendation": <1 sentence action in pt-BR>
}
`

interface NormativeRow {
  code: string
  document: string
  description: string
  severity: string
}

export async function analyzeText(
  req: AnalysisRequest,
  _userId: string | null,
  institutionData: { name: string; id: string },
  resubmissionData: { isResubmission: boolean; submissionCount: number; scoreTrend: string }
): Promise<Partial<AnalysisResult>> {
  const normatives: NormativeRow[] = await getInstitutionNormatives(institutionData.id)
  const normativesText = normatives.map(n => `- ${n.code} (${n.document}): ${n.description}`).join('\n')

  const [claudeSettled, gptSettled] = await Promise.allSettled([
    anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      system: FORENSIC_SYSTEM_PROMPT(institutionData.name, normativesText),
      messages: [{ role: 'user', content: `Analyze this academic text:\n\n${req.text.slice(0, 6000)}` }],
    }),
    openai.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 100,
      messages: [
        {
          role: 'system',
          content: 'You are an AI detection calibrator. Return ONLY a JSON object: {"ai_probability": <integer 0-100>}',
        },
        {
          role: 'user',
          content: `Rate the probability this text is AI-generated (0=human, 100=AI):\n\n${req.text.slice(0, 2000)}`,
        },
      ],
    }),
  ])

  if (claudeSettled.status === 'rejected') {
    throw new Error('Primary analysis engine failed')
  }

  const rawText = claudeSettled.value.content.find(b => b.type === 'text')?.text ?? ''
  const cleaned = rawText.replace(/```json|```/g, '').trim()
  const claudeResult = JSON.parse(cleaned) as {
    overall_ai_score: number
    verdict: string
    detected_model: string
    confidence: number
    paragraphs: Array<{ text: string; ai_score: number; flags: string[] }>
    stylometric: {
      perplexity_score: number
      burstiness_score: number
      vocabulary_richness: number
      avg_sentence_length: number
      lexical_diversity: number
    }
    citations: Array<{ author: string; title: string; year: string | null; full: string; exists: boolean; risk: 'low' | 'medium' | 'critical' }>
    reverse_translation_detected: boolean
    flags: string[]
    compliance_verdict: string
    compliance_risk: string
    forensic_summary: string
    recommendation: string
  }

  let ensembleScore = claudeResult.overall_ai_score
  if (gptSettled.status === 'fulfilled') {
    try {
      const gptRaw = gptSettled.value.choices[0]?.message?.content ?? '{}'
      const gptResult = JSON.parse(gptRaw.replace(/```json|```/g, '').trim()) as { ai_probability?: number }
      ensembleScore = Math.round(
        claudeResult.overall_ai_score * 0.7 + (gptResult.ai_probability ?? claudeResult.overall_ai_score) * 0.3
      )
    } catch { /* use Claude score only */ }
  }

  const verifiedCitations = await verifyCitations(claudeResult.citations ?? [])
  const cidCode = generateCID()
  const textHash = await hashText(req.text)

  return {
    overallAiScore: ensembleScore,
    verdict: claudeResult.verdict as AnalysisResult['verdict'],
    detectedModel: claudeResult.detected_model,
    confidence: claudeResult.confidence,
    paragraphs: claudeResult.paragraphs?.map(p => ({
      text: p.text,
      aiScore: p.ai_score,
      flags: p.flags,
    })) ?? [],
    stylometric: {
      perplexityScore: claudeResult.stylometric?.perplexity_score ?? 0,
      burstiScore: claudeResult.stylometric?.burstiness_score ?? 0,
      vocabularyRichness: claudeResult.stylometric?.vocabulary_richness ?? 0,
      avgSentenceLength: claudeResult.stylometric?.avg_sentence_length ?? 0,
      lexicalDiversity: claudeResult.stylometric?.lexical_diversity ?? 0,
    },
    citations: verifiedCitations,
    flags: claudeResult.flags ?? [],
    reverseTranslationDetected: claudeResult.reverse_translation_detected ?? false,
    pasteDetected: req.pasteDetected,
    compliance: {
      institution: institutionData.name,
      verdict: claudeResult.compliance_verdict as AnalysisResult['compliance']['verdict'],
      riskLevel: claudeResult.compliance_risk as AnalysisResult['compliance']['riskLevel'],
      violatedNormatives: normatives
        .filter(n => ensembleScore >= 50 && n.severity !== 'info')
        .map(n => ({
          code: n.code,
          document: n.document,
          description: n.description,
          severity: n.severity,
        })),
    },
    forensicSummary: claudeResult.forensic_summary ?? '',
    recommendation: claudeResult.recommendation ?? '',
    cidCode,
    textHash,
    resubmissionData,
  }
}
