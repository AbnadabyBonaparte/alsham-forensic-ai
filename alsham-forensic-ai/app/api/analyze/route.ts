import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { analyzeText } from '@/lib/ai/detector'
import { hashText } from '@/lib/ai/crypto'
import { acquireLock, releaseLock } from '@/lib/analysis-lock'
import {
  ANON_ANALYSIS_LIMIT,
  ANON_COOKIE_MAX_AGE,
  ANON_COOKIE_NAME,
  anonRemaining,
  getAnonSecret,
  isAnonLimitReached,
  parseAnonCount,
  serializeAnonCount,
} from '@/lib/anon-limit'

const AnalyzeSchema = z.object({
  text: z.string().min(80).max(50000),
  institutionId: z.string().min(1),
  pasteDetected: z.boolean().default(false),
  pasteCharCount: z.number().default(0),
})

export async function POST(req: NextRequest) {
  let lockKey = ''
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const body = await req.json() as unknown
    const input = AnalyzeSchema.parse(body)

    const anonSecret = getAnonSecret()

    lockKey = `${user?.id ?? req.headers.get('x-forwarded-for') ?? 'anon'}-${Math.floor(Date.now() / 1000)}`
    if (!acquireLock(lockKey)) {
      return NextResponse.json({ error: 'ANALYSIS_IN_PROGRESS', message: 'Análise já em andamento. Aguarde.' }, { status: 429 })
    }

    // Check plan limits
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*, plans(*)')
        .eq('id', user.id)
        .single()

      if (profile) {
        const plan = profile.plans as Record<string, unknown>
        const limit = plan.analyses_per_month as number
        if (limit !== -1 && profile.analyses_used_this_month >= limit) {
          releaseLock(lockKey)
          return NextResponse.json(
            { error: 'QUOTA_EXCEEDED', message: 'Limite de análises do plano atingido. Faça upgrade.' },
            { status: 429 }
          )
        }
        const maxChars = plan.max_chars_per_analysis as number
        if (input.text.length > maxChars) {
          releaseLock(lockKey)
          return NextResponse.json(
            { error: 'TEXT_TOO_LONG', message: `Texto excede o limite de ${maxChars} caracteres do seu plano.` },
            { status: 400 }
          )
        }
      }
    } else {
      // Anonymous users: keep the text-length teaser cap...
      if (input.text.length > 2000) {
        releaseLock(lockKey)
        return NextResponse.json(
          { error: 'TEXT_TOO_LONG', message: 'Crie uma conta gratuita para analisar textos maiores.' },
          { status: 400 }
        )
      }
      // ...and enforce a real free-analysis cap via a signed, httpOnly cookie.
      // Once the visitor has used ANON_ANALYSIS_LIMIT free analyses we return a
      // paywall response (402) the frontend renders as a "sign up to continue" CTA.
      const usedFree = parseAnonCount(req.cookies.get(ANON_COOKIE_NAME)?.value, anonSecret)
      if (isAnonLimitReached(usedFree)) {
        releaseLock(lockKey)
        return NextResponse.json(
          {
            error: 'ANON_LIMIT_REACHED',
            message: 'Você usou suas análises gratuitas. Crie uma conta para continuar.',
            limit: ANON_ANALYSIS_LIMIT,
            used: usedFree,
            remaining: 0,
          },
          { status: 402 }
        )
      }
    }

    // Get institution
    const { data: institution } = await supabase
      .from('institutions')
      .select('id, name, strictness_level')
      .eq('id', input.institutionId)
      .single()

    if (!institution) {
      releaseLock(lockKey)
      return NextResponse.json({ error: 'INSTITUTION_NOT_FOUND' }, { status: 400 })
    }

    // Check resubmission
    const textHash = await hashText(input.text)
    let resubmissionData = { isResubmission: false, submissionCount: 0, scoreTrend: 'FIRST_SUBMISSION' }
    if (user) {
      const { data: resubCheck } = await supabase.rpc('check_resubmission', {
        p_user_id: user.id,
        p_hash: textHash,
      })
      if (resubCheck) {
        resubmissionData = {
          isResubmission: (resubCheck as Record<string, unknown>).is_resubmission as boolean,
          submissionCount: (resubCheck as Record<string, unknown>).submission_count as number,
          scoreTrend: (resubCheck as Record<string, unknown>).score_trend as string,
        }
      }
    }

    const startTime = Date.now()
    const result = await analyzeText(
      input,
      user?.id ?? null,
      { id: institution.id, name: institution.name },
      resubmissionData
    )
    const processingTime = Date.now() - startTime

    const { data: savedAnalysis } = await supabase
      .from('analyses')
      .insert({
        user_id: user?.id ?? null,
        text_hash: textHash,
        text_preview: input.text.slice(0, 200),
        text_length: input.text.length,
        word_count: input.text.trim().split(/\s+/).length,
        institution_id: input.institutionId,
        overall_ai_score: result.overallAiScore,
        verdict: result.verdict,
        detected_model: result.detectedModel,
        confidence: result.confidence,
        paragraphs: result.paragraphs,
        stylometric: result.stylometric,
        citations: result.citations,
        flags: result.flags,
        compliance_verdict: result.compliance?.verdict,
        compliance_risk: result.compliance?.riskLevel,
        paste_detected: input.pasteDetected,
        reverse_translation_detected: result.reverseTranslationDetected,
        analysis_engine: 'alsham-forensic-ensemble-v1',
        processing_time_ms: processingTime,
        cid_code: result.cidCode,
      })
      .select('id')
      .single()

    if (user) {
      await Promise.allSettled([
        supabase.from('text_submission_history').insert({
          user_id: user.id,
          text_hash: textHash,
          analysis_id: savedAnalysis?.id,
          ai_score: result.overallAiScore,
        }),
        supabase.rpc('increment_analyses_count', { p_user_id: user.id }),
      ])
    }

    releaseLock(lockKey)

    const response = NextResponse.json({ ...result, id: savedAnalysis?.id })

    // For anonymous visitors, persist the incremented free-usage counter in a
    // signed, httpOnly cookie so the paywall triggers once the free tier is used up.
    if (!user) {
      const usedFree = parseAnonCount(req.cookies.get(ANON_COOKIE_NAME)?.value, anonSecret)
      const nextCount = usedFree + 1
      response.cookies.set(ANON_COOKIE_NAME, serializeAnonCount(nextCount, anonSecret), {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: ANON_COOKIE_MAX_AGE,
      })
      response.headers.set('X-Anon-Analyses-Remaining', String(anonRemaining(nextCount)))
    }

    return response
  } catch (err: unknown) {
    if (lockKey) releaseLock(lockKey)
    console.error('[ANALYZE ERROR]', err)
    if (err && typeof err === 'object' && 'name' in err && err.name === 'ZodError') {
      return NextResponse.json({ error: 'VALIDATION_ERROR', details: (err as unknown as { errors: unknown }).errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'ANALYSIS_FAILED', message: 'Erro interno na análise forense.' }, { status: 500 })
  }
}
