# ALSHAM FORENSIC AI — Prompt Complementar
# Execute APÓS o Master Build Prompt principal
# Commit: "fix: production gaps — atomic counters, auth flows, stripe checkout, verify page"

---

## GAP 1: FUNÇÕES SQL FALTANDO NO SCHEMA

No Supabase SQL Editor, execute este patch antes de qualquer teste:

```sql
-- Incremento atômico para evitar race condition em cliques duplos
CREATE OR REPLACE FUNCTION increment_analyses_count(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE profiles
  SET analyses_used_this_month = analyses_used_this_month + 1,
      updated_at = NOW()
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Busca de plano com limites para a API (evita N+1)
CREATE OR REPLACE FUNCTION get_user_plan_limits(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
BEGIN
  SELECT JSONB_BUILD_OBJECT(
    'plan_id', p.plan_id,
    'analyses_used', p.analyses_used_this_month,
    'analyses_limit', pl.analyses_per_month,
    'max_chars', pl.max_chars_per_analysis,
    'pdf_reports', pl.pdf_reports,
    'scholar_links', pl.scholar_links,
    'subscription_status', p.subscription_status
  )
  INTO v_result
  FROM profiles p
  JOIN plans pl ON pl.id = p.plan_id
  WHERE p.id = p_user_id;
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Busca pública de CID para página de verificação
CREATE OR REPLACE FUNCTION get_public_analysis_by_cid(p_cid TEXT)
RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
BEGIN
  SELECT JSONB_BUILD_OBJECT(
    'cid_code', a.cid_code,
    'overall_ai_score', a.overall_ai_score,
    'verdict', a.verdict,
    'detected_model', a.detected_model,
    'compliance_verdict', a.compliance_verdict,
    'compliance_risk', a.compliance_risk,
    'institution_name', i.name,
    'forensic_summary', (a.stylometric->>'forensic_summary'),
    'text_hash', a.text_hash,
    'text_preview', a.text_preview,
    'created_at', a.created_at,
    'analysis_engine', a.analysis_engine
  )
  INTO v_result
  FROM analyses a
  LEFT JOIN institutions i ON i.id = a.institution_id
  WHERE a.cid_code = p_cid;
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Política pública para verificação de CID (sem auth)
CREATE POLICY "analyses_public_cid_lookup" ON analyses
  FOR SELECT USING (cid_code IS NOT NULL);
```

---

## GAP 2: VERCEL PRO — CONFIGURAÇÃO CORRETA

### `vercel.json` (substituir o anterior)
```json
{
  "functions": {
    "app/api/analyze/route.ts": {
      "maxDuration": 60,
      "memory": 1024
    },
    "app/api/generate-report/route.ts": {
      "maxDuration": 30,
      "memory": 512
    },
    "app/api/verify-citations/route.ts": {
      "maxDuration": 30,
      "memory": 256
    }
  },
  "regions": ["gru1"]
}
```

**ATENÇÃO:** `maxDuration > 10` exige Vercel Pro (R$100/mês aprox).
Alternativa gratuita: separar o Tavily em background job com Supabase Edge Function.

### Otimização de timeout — estratégia paralela
Em `lib/ai/detector.ts`, rodar Claude e GPT em paralelo, não sequencial:

```typescript
// ERRADO (sequencial — ~25s)
const claudeResult = await callClaude(text)
const gptResult = await callGPT(text)

// CORRETO (paralelo — ~12s)
const [claudeResult, gptResult] = await Promise.allSettled([
  callClaude(text),
  callGPT(text)
])

// Tavily roda em paralelo com os LLMs
const [analysisResults, citationResults] = await Promise.allSettled([
  Promise.all([callClaude(text), callGPT(text)]),
  verifyCitations(extractedCitations) // extraído de prompt inicial
])
```

---

## GAP 3: PROTEÇÃO CONTRA DOUBLE-CLICK NA API

### `lib/analysis-lock.ts`
```typescript
// Prevenção de análises duplicadas simultâneas (in-memory para Edge)
const activeAnalyses = new Map<string, boolean>()

export function acquireLock(key: string): boolean {
  if (activeAnalyses.get(key)) return false
  activeAnalyses.set(key, true)
  setTimeout(() => activeAnalyses.delete(key), 90_000) // auto-release após 90s
  return true
}

export function releaseLock(key: string) {
  activeAnalyses.delete(key)
}
```

Em `app/api/analyze/route.ts`, adicionar logo após validar o usuário:
```typescript
const lockKey = `${user?.id || req.ip}-${Date.now().toString().slice(0, -3)}`
if (!acquireLock(lockKey)) {
  return NextResponse.json({ error: 'ANALYSIS_IN_PROGRESS' }, { status: 429 })
}
try {
  // ... resto da análise
} finally {
  releaseLock(lockKey)
}
```

---

## GAP 4: STRIPE CHECKOUT — ROTAS FALTANDO

### `app/api/stripe/create-checkout/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

const PRICE_IDS: Record<string, string> = {
  estudantil:   process.env.STRIPE_PRICE_ESTUDANTIL!,
  profissional: process.env.STRIPE_PRICE_PROFISSIONAL!,
  institucional: process.env.STRIPE_PRICE_INSTITUCIONAL!,
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })

  const { planId } = await req.json()
  const priceId = PRICE_IDS[planId]
  if (!priceId) return NextResponse.json({ error: 'INVALID_PLAN' }, { status: 400 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_customer_id, email, full_name')
    .eq('id', user.id)
    .single()

  let customerId = profile?.stripe_customer_id
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email!,
      name: profile?.full_name || undefined,
      metadata: { supabase_user_id: user.id }
    })
    customerId = customer.id
    await supabase.from('profiles').update({ stripe_customer_id: customerId }).eq('id', user.id)
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?upgraded=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
    metadata: { user_id: user.id, plan_id: planId },
    locale: 'pt-BR',
    currency: 'brl',
    subscription_data: {
      metadata: { user_id: user.id, plan_id: planId }
    }
  })

  return NextResponse.json({ url: session.url })
}
```

### `app/api/stripe/portal/route.ts` — Gerenciar assinatura
```typescript
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles').select('stripe_customer_id').eq('id', user.id).single()

  if (!profile?.stripe_customer_id) {
    return NextResponse.json({ error: 'NO_SUBSCRIPTION' }, { status: 400 })
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: profile.stripe_customer_id,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings`,
  })

  return NextResponse.json({ url: session.url })
}
```

### Adicionar ao `.env.local`:
```
STRIPE_PRICE_ESTUDANTIL=price_xxxxx
STRIPE_PRICE_PROFISSIONAL=price_xxxxx
STRIPE_PRICE_INSTITUCIONAL=price_xxxxx
```

---

## GAP 5: PÁGINA DE VERIFICAÇÃO PÚBLICA (CID)

### `app/verify/[cid]/page.tsx`
```typescript
import { createClient } from '@/lib/supabase/server'
import { hashText } from '@/lib/ai/crypto'
import { notFound } from 'next/navigation'
import { VerifyResult } from '@/components/forensic/VerifyResult'

export default async function VerifyPage({ params }: { params: { cid: string } }) {
  const supabase = await createClient()

  const { data } = await supabase
    .rpc('get_public_analysis_by_cid', { p_cid: params.cid })

  if (!data) notFound()

  return (
    <main style={{ minHeight: '100vh', background: '#0A0F1E', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <VerifyResult data={data} cid={params.cid} />
    </main>
  )
}

export async function generateMetadata({ params }: { params: { cid: string } }) {
  return {
    title: `Verificação CID ${params.cid} — ALSHAM Forensic AI`,
    description: 'Verifique a autenticidade deste Certificado de Integridade Digital',
    robots: 'noindex' // não indexar laudos individuais
  }
}
```

### `components/forensic/VerifyResult.tsx`
```typescript
'use client'
import { useState, useEffect } from 'react'

interface VerifyData {
  cid_code: string
  overall_ai_score: number
  verdict: string
  detected_model: string
  compliance_verdict: string
  institution_name: string
  text_hash: string
  text_preview: string
  created_at: string
  analysis_engine: string
}

export function VerifyResult({ data, cid }: { data: VerifyData; cid: string }) {
  const [inputHash, setInputHash] = useState('')
  const [hashStatus, setHashStatus] = useState<'idle' | 'match' | 'mismatch'>('idle')

  const verdictColor = {
    HUMAN: '#16A34A', SUSPICIOUS: '#D97706',
    AI_GENERATED: '#DC2626', DEFINITIVE_AI: '#7F1D1D'
  }[data.verdict] || '#94A3B8'

  const verifyHash = async () => {
    if (!inputHash.trim()) return
    const enc = new TextEncoder()
    const buf = await crypto.subtle.digest('SHA-256', enc.encode(inputHash))
    const hash = Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
    setHashStatus(hash === data.text_hash ? 'match' : 'mismatch')
  }

  return (
    <div style={{ maxWidth: 600, width: '100%', fontFamily: 'monospace' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{ fontSize: 10, letterSpacing: 4, color: '#C9A84C', marginBottom: 8 }}>
          ALSHAM GLOBAL COMMERCE · CERTIFICADO DE INTEGRIDADE DIGITAL
        </div>
        <div style={{ fontSize: 22, fontWeight: 700, color: '#F8FAFC' }}>{cid}</div>
        <div style={{ fontSize: 12, color: '#64748B', marginTop: 4 }}>
          Emitido em {new Date(data.created_at).toLocaleString('pt-BR')}
        </div>
      </div>

      {/* Score */}
      <div style={{ background: '#1B2A4A', borderRadius: 12, padding: '1.5rem', marginBottom: '1rem', textAlign: 'center' }}>
        <div style={{ fontSize: 48, fontWeight: 800, color: verdictColor }}>{data.overall_ai_score}</div>
        <div style={{ fontSize: 11, letterSpacing: 3, color: verdictColor, marginTop: 4 }}>{data.verdict}</div>
        <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 8 }}>Modelo detectado: {data.detected_model}</div>
      </div>

      {/* Details */}
      <div style={{ background: '#1B2A4A', borderRadius: 12, padding: '1rem', marginBottom: '1rem' }}>
        <table style={{ width: '100%', fontSize: 12, color: '#F8FAFC', borderCollapse: 'collapse' }}>
          <tbody>
            {[
              ['Instituição', data.institution_name],
              ['Conformidade', data.compliance_verdict],
              ['Motor de análise', data.analysis_engine],
              ['SHA-256 do texto', data.text_hash.slice(0, 16) + '…'],
            ].map(([k, v]) => (
              <tr key={k}>
                <td style={{ color: '#64748B', padding: '6px 0' }}>{k}</td>
                <td style={{ textAlign: 'right', padding: '6px 0' }}>{v}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Hash verification */}
      <div style={{ background: '#1B2A4A', borderRadius: 12, padding: '1rem', marginBottom: '1rem' }}>
        <div style={{ fontSize: 10, letterSpacing: 2, color: '#C9A84C', marginBottom: 8 }}>
          VERIFICAR DOCUMENTO ORIGINAL
        </div>
        <p style={{ fontSize: 12, color: '#94A3B8', margin: '0 0 12px' }}>
          Cole o texto exato do documento analisado para confirmar que este certificado corresponde a ele.
        </p>
        <textarea
          value={inputHash}
          onChange={e => { setInputHash(e.target.value); setHashStatus('idle') }}
          placeholder="Cole o texto do documento aqui..."
          style={{ width: '100%', minHeight: 80, background: '#0A0F1E', color: '#F8FAFC', border: '0.5px solid #334155', borderRadius: 8, padding: 10, fontSize: 12, boxSizing: 'border-box', resize: 'vertical' }}
        />
        <button
          onClick={verifyHash}
          disabled={!inputHash.trim()}
          style={{ marginTop: 8, background: '#C9A84C', color: '#0A0F1E', border: 'none', padding: '8px 20px', borderRadius: 6, fontWeight: 700, cursor: 'pointer', fontSize: 12 }}
        >
          Verificar Hash
        </button>
        {hashStatus === 'match' && (
          <div style={{ marginTop: 10, padding: '10px 14px', background: '#14532D', borderRadius: 8, color: '#86EFAC', fontSize: 13, fontWeight: 600 }}>
            ✓ DOCUMENTO AUTÊNTICO — Hash SHA-256 confere com o certificado original.
          </div>
        )}
        {hashStatus === 'mismatch' && (
          <div style={{ marginTop: 10, padding: '10px 14px', background: '#7F1D1D', borderRadius: 8, color: '#FCA5A5', fontSize: 13, fontWeight: 600 }}>
            ⛔ ALERTA DE FRAUDE — O texto não corresponde ao documento analisado neste certificado.
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ textAlign: 'center', fontSize: 10, color: '#334155' }}>
        ALSHAM FORENSIC AI™ · forensic.alshamglobal.com.br · ALSHAM Global Commerce Ltda
      </div>
    </div>
  )
}
```

---

## GAP 6: VARIÁVEIS DE AMBIENTE — VALIDAÇÃO NO STARTUP

### `lib/env.ts`
```typescript
// Falha em build time se variável crítica estiver faltando
const required = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'ANTHROPIC_API_KEY',
  'OPENAI_API_KEY',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
  'RESEND_API_KEY',
  'NEXT_PUBLIC_APP_URL',
] as const

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`)
  }
}

export const env = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  anthropicKey: process.env.ANTHROPIC_API_KEY!,
  openaiKey: process.env.OPENAI_API_KEY!,
  tavilyKey: process.env.TAVILY_API_KEY, // opcional
  stripeSecret: process.env.STRIPE_SECRET_KEY!,
  stripeWebhook: process.env.STRIPE_WEBHOOK_SECRET!,
  resendKey: process.env.RESEND_API_KEY!,
  appUrl: process.env.NEXT_PUBLIC_APP_URL!,
} as const
```

---

## CHECKLIST DE PRODUÇÃO ANTES DO DEPLOY

```bash
# 1. TypeScript sem erros
npx tsc --noEmit

# 2. Build local sem erros
npm run build

# 3. Testar análise completa localmente
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"text":"[texto teste 200+ chars]","institutionId":"ufpb","pasteDetected":false,"pasteCharCount":0}'

# 4. Testar verificação de CID
curl http://localhost:3000/verify/ALSHAM-XXXXX-YYYYY

# 5. Verificar que Stripe webhook está configurado
stripe listen --forward-to localhost:3000/api/webhook/stripe
```

---

## ADIÇÕES AO `.env.local`

```
# Stripe — preços criados no Stripe Dashboard
STRIPE_PRICE_ESTUDANTIL=price_xxxxxxxxxxxxx
STRIPE_PRICE_PROFISSIONAL=price_xxxxxxxxxxxxx
STRIPE_PRICE_INSTITUCIONAL=price_xxxxxxxxxxxxx

# Tavily (opcional mas recomendado — free tier: 1000 req/mês)
TAVILY_API_KEY=tvly-xxxxxxxxxxxxx
```

---

## COMMIT FINAL

```bash
git add .
git commit -m "fix: production gaps — atomic SQL counters, parallel AI calls, stripe checkout, CID verify page, env validation"
git push origin main
```
