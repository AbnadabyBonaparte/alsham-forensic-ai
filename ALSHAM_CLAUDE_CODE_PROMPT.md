# ALSHAM FORENSIC AI — Master Build Prompt
# Para Claude Code · ALSHAM Global Commerce Ltda
# Execute em uma única sessão. Commit ao final: "feat: ALSHAM Forensic AI v1.0 — full SaaS build"

---

## CONTEXTO DO PROJETO

Você está construindo o **ALSHAM Forensic AI**, um SaaS global de detecção de IA em textos acadêmicos com conformidade jurídica institucional. É o único produto no mercado com:
- Referência a normativas reais brasileiras (Portaria CNPq 2664/2026, Resolução UFPB 57/2025)
- Certificado de Integridade Digital (CID) com hash SHA-256 verificável
- Detecção de tentativa de burla por reenvio (dosimetria de sanção)
- Verificação bibliográfica com link Google Scholar

**Stack obrigatória:**
- Next.js 15 (App Router, TypeScript strict)
- Supabase (auth + database + storage)
- Vercel (deploy target)
- Anthropic Claude API (claude-sonnet-4-20250514) — motor principal
- OpenAI API (gpt-4o-mini) — motor secundário para ensemble
- Tavily API — busca em tempo real para citações
- Stripe — pagamentos e assinaturas
- Resend — emails transacionais
- Tailwind CSS + shadcn/ui
- @react-pdf/renderer — geração de PDF do certificado

**Padrão ALSHAM (obrigatório):**
1. Zero cores hardcoded — sempre CSS variables ou Tailwind tokens
2. shadcn/ui obrigatório para todos os componentes de UI
3. 100% dados reais — zero mock data em produção
4. Dark mode obrigatório (next-themes)
5. Estados completos: loading, error, empty, success
6. Estrutura canônica: components/ lib/ app/ types/ hooks/

---

## TAREFA 1: INICIALIZAR PROJETO

```bash
npx create-next-app@latest alsham-forensic-ai \
  --typescript --tailwind --eslint --app --src-dir=false \
  --import-alias="@/*"

cd alsham-forensic-ai

# Core dependencies
npm install @supabase/supabase-js @supabase/ssr \
  @anthropic-ai/sdk openai \
  stripe @stripe/stripe-js \
  resend \
  @react-pdf/renderer \
  next-themes \
  zod \
  lucide-react \
  date-fns \
  clsx tailwind-merge

# shadcn/ui
npx shadcn@latest init --defaults
npx shadcn@latest add button card input textarea select badge \
  dialog sheet progress skeleton alert tabs separator toast \
  dropdown-menu avatar table

# Types
npm install -D @types/node
```

---

## TAREFA 2: VARIÁVEIS DE AMBIENTE

Criar `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT_REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[ANON_KEY]
SUPABASE_SERVICE_ROLE_KEY=[SERVICE_ROLE_KEY]

ANTHROPIC_API_KEY=[KEY]
OPENAI_API_KEY=[KEY]
TAVILY_API_KEY=[KEY]

STRIPE_SECRET_KEY=[KEY]
STRIPE_WEBHOOK_SECRET=[KEY]
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=[KEY]

RESEND_API_KEY=[KEY]
RESEND_FROM_EMAIL=forense@alshamglobal.com.br

NEXT_PUBLIC_APP_URL=https://forensic.alshamglobal.com.br
```

---

## TAREFA 3: ESTRUTURA COMPLETA DE ARQUIVOS

### `types/index.ts`
```typescript
export type Verdict = 'HUMAN' | 'SUSPICIOUS' | 'AI_GENERATED' | 'DEFINITIVE_AI'
export type ComplianceVerdict = 'CONFORME' | 'ALERTA' | 'VIOLAÇÃO'
export type RiskLevel = 'BAIXO' | 'MÉDIO' | 'ALTO' | 'CRÍTICO'
export type StrictnessLevel = 'MÁXIMO' | 'ALTO' | 'MÉDIO' | 'PADRÃO'

export interface AnalysisRequest {
  text: string
  institutionId: string
  pasteDetected: boolean
  pasteCharCount: number
}

export interface ParagraphResult {
  text: string
  aiScore: number
  flags: string[]
}

export interface StylemetricResult {
  perplexityScore: number
  burstiScore: number
  vocabularyRichness: number
  avgSentenceLength: number
  lexicalDiversity: number
}

export interface CitationResult {
  author: string
  title: string
  year: string | null
  full: string
  exists: boolean
  risk: 'low' | 'medium' | 'critical'
  scholarUrl: string
}

export interface ComplianceResult {
  institution: string
  verdict: ComplianceVerdict
  riskLevel: RiskLevel
  violatedNormatives: ViolatedNormative[]
}

export interface ViolatedNormative {
  code: string
  document: string
  description: string
  severity: string
}

export interface AnalysisResult {
  id: string
  overallAiScore: number
  verdict: Verdict
  detectedModel: string
  confidence: number
  paragraphs: ParagraphResult[]
  stylometric: StylemetricResult
  citations: CitationResult[]
  flags: string[]
  reverseTranslationDetected: boolean
  pasteDetected: boolean
  compliance: ComplianceResult
  forensicSummary: string
  recommendation: string
  cidCode: string
  textHash: string
  resubmissionData: {
    isResubmission: boolean
    submissionCount: number
    scoreTrend: string
  }
  createdAt: string
}

export interface Institution {
  id: string
  name: string
  nameShort: string
  country: string
  strictnessLevel: StrictnessLevel
  aiTolerancePct: number
}

export interface Plan {
  id: string
  name: string
  namePt: string
  priceBrl: number
  analysesPerMonth: number
  maxCharsPerAnalysis: number
  pdfReports: boolean
  apiAccess: boolean
  scholarLinks: boolean
}

export interface Profile {
  id: string
  email: string
  fullName: string | null
  institution: string | null
  planId: string
  analysesUsedThisMonth: number
  subscriptionStatus: string
}
```

---

### `lib/supabase/client.ts`
```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

### `lib/supabase/server.ts`
```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )
}
```

---

### `lib/ai/detector.ts` — MOTOR PRINCIPAL
```typescript
import Anthropic from '@anthropic-ai/sdk'
import OpenAI from 'openai'
import { AnalysisRequest, AnalysisResult } from '@/types'
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

export async function analyzeText(
  req: AnalysisRequest,
  userId: string | null,
  institutionData: { name: string; id: string },
  resubmissionData: { isResubmission: boolean; submissionCount: number; scoreTrend: string }
): Promise<Partial<AnalysisResult>> {
  const startTime = Date.now()
  const normatives = await getInstitutionNormatives(institutionData.id)
  const normativesText = normatives.map(n => `- ${n.code} (${n.document}): ${n.description}`).join('\n')

  // Primary analysis — Claude
  const claudeResponse = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    system: FORENSIC_SYSTEM_PROMPT(institutionData.name, normativesText),
    messages: [{ role: 'user', content: `Analyze this academic text:\n\n${req.text.slice(0, 6000)}` }]
  })

  const rawText = claudeResponse.content.find(b => b.type === 'text')?.text || ''
  const cleaned = rawText.replace(/```json|```/g, '').trim()
  const claudeResult = JSON.parse(cleaned)

  // Secondary verification — GPT-4o-mini (ensemble for score calibration)
  let ensembleScore = claudeResult.overall_ai_score
  try {
    const gptResponse = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 100,
      messages: [{
        role: 'system',
        content: 'You are an AI detection calibrator. Return ONLY a JSON object: {"ai_probability": <integer 0-100>}'
      }, {
        role: 'user',
        content: `Rate the probability this text is AI-generated (0=human, 100=AI):\n\n${req.text.slice(0, 2000)}`
      }]
    })
    const gptRaw = gptResponse.choices[0]?.message?.content || '{}'
    const gptResult = JSON.parse(gptRaw.replace(/```json|```/g, '').trim())
    // Weighted ensemble: 70% Claude + 30% GPT
    ensembleScore = Math.round(claudeResult.overall_ai_score * 0.7 + (gptResult.ai_probability || claudeResult.overall_ai_score) * 0.3)
  } catch { /* Use Claude score only if GPT fails */ }

  // Citation verification with Tavily
  const verifiedCitations = await verifyCitations(claudeResult.citations || [])

  const cidCode = generateCID()
  const textHash = await hashText(req.text)

  return {
    overallAiScore: ensembleScore,
    verdict: claudeResult.verdict,
    detectedModel: claudeResult.detected_model,
    confidence: claudeResult.confidence,
    paragraphs: claudeResult.paragraphs,
    stylometric: {
      perplexityScore: claudeResult.stylometric?.perplexity_score,
      burstiScore: claudeResult.stylometric?.burstiness_score,
      vocabularyRichness: claudeResult.stylometric?.vocabulary_richness,
      avgSentenceLength: claudeResult.stylometric?.avg_sentence_length,
      lexicalDiversity: claudeResult.stylometric?.lexical_diversity,
    },
    citations: verifiedCitations,
    flags: claudeResult.flags,
    reverseTranslationDetected: claudeResult.reverse_translation_detected,
    pasteDetected: req.pasteDetected,
    compliance: {
      institution: institutionData.name,
      verdict: claudeResult.compliance_verdict,
      riskLevel: claudeResult.compliance_risk,
      violatedNormatives: normatives
        .filter(n => claudeResult.overall_ai_score >= 50 && n.severity !== 'info')
        .map(n => ({ code: n.code, document: n.document, description: n.description, severity: n.severity }))
    },
    forensicSummary: claudeResult.forensic_summary,
    recommendation: claudeResult.recommendation,
    cidCode,
    textHash,
    resubmissionData,
  }
}
```

---

### `lib/ai/citation-verifier.ts`
```typescript
// Verify citations via Tavily search + Google Scholar links
interface RawCitation {
  author: string
  title: string
  year: string | null
  full: string
  exists: boolean
  risk: 'low' | 'medium' | 'critical'
}

export async function verifyCitations(citations: RawCitation[]) {
  if (!citations.length) return []

  const TAVILY_KEY = process.env.TAVILY_API_KEY
  if (!TAVILY_KEY) return citations.map(c => ({ ...c, scholarUrl: buildScholarUrl(c) }))

  const results = await Promise.allSettled(
    citations.map(async (citation) => {
      const query = [citation.author, citation.title, citation.year].filter(Boolean).join(' ')
      
      try {
        const res = await fetch('https://api.tavily.com/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            api_key: TAVILY_KEY,
            query: `academic paper "${query}"`,
            search_depth: 'basic',
            max_results: 3,
            include_domains: ['scholar.google.com', 'pubmed.ncbi.nlm.nih.gov', 'doi.org', 'crossref.org', 'scielo.br']
          })
        })
        const data = await res.json()
        const found = data.results?.length > 0
        
        return {
          ...citation,
          exists: found,
          risk: found ? 'low' : (citation.risk === 'low' ? 'medium' : 'critical'),
          scholarUrl: buildScholarUrl(citation)
        } as const
      } catch {
        return { ...citation, scholarUrl: buildScholarUrl(citation) }
      }
    })
  )

  return results.map((r, i) => 
    r.status === 'fulfilled' ? r.value : { ...citations[i], scholarUrl: buildScholarUrl(citations[i]) }
  )
}

function buildScholarUrl(c: { author: string; title: string; year: string | null }) {
  const q = [c.author, c.title, c.year].filter(Boolean).join(' ')
  return `https://scholar.google.com/scholar?q=${encodeURIComponent(q)}`
}
```

---

### `lib/ai/crypto.ts`
```typescript
export function generateCID(): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `ALSHAM-${timestamp}-${random}`
}

export async function hashText(text: string): Promise<string> {
  if (typeof crypto === 'undefined') {
    // Node.js fallback
    const { createHash } = await import('crypto')
    return createHash('sha256').update(text).digest('hex')
  }
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}
```

---

### `lib/institutions/normatives.ts`
```typescript
import { createClient } from '@/lib/supabase/server'

export async function getInstitutionNormatives(institutionId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('normatives')
    .select('*')
    .eq('institution_id', institutionId)
    .eq('active', true)
    .order('severity', { ascending: false })
  
  return data || []
}

export async function getInstitutions() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('institutions')
    .select('*')
    .eq('active', true)
    .order('country, name')
  
  return data || []
}
```

---

### `app/api/analyze/route.ts` — API ROUTE PRINCIPAL
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { analyzeText } from '@/lib/ai/detector'
import { hashText } from '@/lib/ai/crypto'

const AnalyzeSchema = z.object({
  text: z.string().min(80).max(50000),
  institutionId: z.string(),
  pasteDetected: z.boolean().default(false),
  pasteCharCount: z.number().default(0),
})

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const body = await req.json()
    const input = AnalyzeSchema.parse(body)

    // Check plan limits
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*, plans(*)')
        .eq('id', user.id)
        .single()

      if (profile) {
        const plan = profile.plans as any
        const limit = plan.analyses_per_month
        if (limit !== -1 && profile.analyses_used_this_month >= limit) {
          return NextResponse.json({ error: 'QUOTA_EXCEEDED', message: 'Limite de análises do plano atingido' }, { status: 429 })
        }
        if (input.text.length > plan.max_chars_per_analysis) {
          return NextResponse.json({ error: 'TEXT_TOO_LONG', message: `Texto excede o limite de ${plan.max_chars_per_analysis} caracteres do seu plano` }, { status: 400 })
        }
      }
    }

    // Get institution data
    const { data: institution } = await supabase
      .from('institutions')
      .select('id, name, strictness_level')
      .eq('id', input.institutionId)
      .single()

    if (!institution) {
      return NextResponse.json({ error: 'INSTITUTION_NOT_FOUND' }, { status: 400 })
    }

    // Check resubmission
    const textHash = await hashText(input.text)
    let resubmissionData = { isResubmission: false, submissionCount: 0, scoreTrend: 'FIRST_SUBMISSION' }
    
    if (user) {
      const { data: resubCheck } = await supabase.rpc('check_resubmission', {
        p_user_id: user.id,
        p_hash: textHash
      })
      if (resubCheck) resubmissionData = resubCheck
    }

    // Run analysis
    const startTime = Date.now()
    const result = await analyzeText(
      input,
      user?.id || null,
      { id: institution.id, name: institution.name },
      resubmissionData
    )
    const processingTime = Date.now() - startTime

    // Save to database
    const { data: savedAnalysis } = await supabase
      .from('analyses')
      .insert({
        user_id: user?.id || null,
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
        analysis_engine: 'claude-sonnet-4+gpt-4o-mini-ensemble',
        processing_time_ms: processingTime,
        cid_code: result.cidCode,
      })
      .select('id')
      .single()

    // Record submission history
    if (user) {
      await supabase.from('text_submission_history').insert({
        user_id: user.id,
        text_hash: textHash,
        analysis_id: savedAnalysis?.id,
        ai_score: result.overallAiScore,
      })

      // Increment usage counter
      await supabase.rpc('increment_analyses_count', { p_user_id: user.id })
    }

    return NextResponse.json({ ...result, id: savedAnalysis?.id })
  } catch (err: any) {
    console.error('[ANALYZE ERROR]', err)
    if (err.name === 'ZodError') {
      return NextResponse.json({ error: 'VALIDATION_ERROR', details: err.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'ANALYSIS_FAILED', message: 'Erro interno na análise forense' }, { status: 500 })
  }
}
```

---

### `app/(landing)/page.tsx` — LANDING PAGE
Construir landing page completa com:
- Hero: "O único detector forense com conformidade CNPq 2664/2026"
- Demo interativo (analisar texto sem cadastro — limite 3x)
- Tabela comparativa vs GPTZero, Turnitin, Copyleaks
- Seção de diferenciais: CID, normativas, dosimetria
- Pricing com 4 planos em BRL
- CTA: "Analisar Gratuitamente" + "Plano Institucional"
- Depoimentos placeholder (substituir no futuro)

**Paleta ALSHAM Forensic:**
- Background: `#0A0F1E` (deep navy)
- Primary: `#1B2A4A` (navy)
- Accent Gold: `#C9A84C`
- Danger: `#DC2626`
- Success: `#16A34A`
- Text: `#F8FAFC`
- Muted: `#94A3B8`

### `app/(dashboard)/analyze/page.tsx` — PAINEL DE ANÁLISE
Construir interface completa:
- Textarea com detecção de paste (event listener onPaste)
- Seletor de instituição (busca em tempo real)
- Botão analisar com estado de loading animado (5 etapas visíveis)
- ResultPanel completo com todos os módulos:
  - ScoreGauge (SVG semicírculo animado)
  - Diagnóstico com modelo detectado
  - ParagraphHeatmap com barra de risco por parágrafo
  - StylemetricPanel (5 métricas)
  - CitationPanel com links Scholar e badge de risco
  - FlagsPanel com badges
  - CompliancePanel com normativas reais citadas
  - ResubmissionAlert (se detectado)
  - PasteAlert (se detectado)
  - ForensicOpinion
  - CIDCertificate (com botão de download PDF)
- Histórico de análises recentes (sidebar ou seção abaixo)

---

## TAREFA 4: STRIPE — PRODUTOS E PREÇOS

Criar produtos no Stripe Dashboard:
- Estudantil: R$29,90/mês
- Profissional: R$89,90/mês  
- Institucional: R$497,00/mês

### `app/api/webhook/stripe/route.ts`
Processar eventos:
- `customer.subscription.created` → atualizar plan_id no profile
- `customer.subscription.deleted` → reverter para free
- `invoice.payment_failed` → marcar subscription_status = 'past_due'

---

## TAREFA 5: GERAÇÃO DE PDF

### `lib/pdf/certificate.tsx`
Usar `@react-pdf/renderer` para gerar PDF do CID com:
- Logo ALSHAM + "Certificado de Integridade Digital"
- Código CID, hash SHA-256
- Score, veredito, modelo detectado
- Lista de normativas verificadas
- QR code (link para verificação pública)
- Rodapé com data, instituição, ALSHAM Global Commerce

---

## TAREFA 6: PÁGINA DE VERIFICAÇÃO PÚBLICA

### `app/verify/[cid]/page.tsx`
Página pública acessível via QR code:
- Busca o CID no banco
- Exibe o resultado completo da análise
- Verifica se o hash do texto bate
- Exibe "DOCUMENTO VERIFICADO" ou "HASH NÃO CONFERE — ALERTA DE FRAUDE"

---

## TAREFA 7: CONFIGURAÇÃO DE DEPLOY

### `vercel.json`
```json
{
  "functions": {
    "app/api/analyze/route.ts": { "maxDuration": 60 },
    "app/api/generate-report/route.ts": { "maxDuration": 30 }
  }
}
```

### Variáveis de ambiente no Vercel:
Configurar todas as variáveis do `.env.local` no painel Vercel.

### Domínio:
Configurar `forensic.alshamglobal.com.br` no Vercel → DNS via Cloudflare.

---

## REGRAS DE EXECUÇÃO

1. Crie TODOS os arquivos listados acima
2. Não deixe TODOs — implemente tudo funcionando
3. Zero TypeScript errors — `npx tsc --noEmit` deve passar
4. Teste localmente com `npm run dev` antes do commit
5. Commit único no final: `feat: ALSHAM Forensic AI v1.0 — full SaaS build`
6. Push para branch `main`

## PRIORIDADE DE EXECUÇÃO

1. Schema SQL aplicado no Supabase
2. `lib/` completo (supabase, ai, institutions, stripe)
3. `app/api/` completo
4. `app/(landing)/page.tsx`
5. `app/(dashboard)/analyze/page.tsx`
6. `app/(auth)/` (login/signup)
7. PDF + verificação pública
8. Deploy Vercel
