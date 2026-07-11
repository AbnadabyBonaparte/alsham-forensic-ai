# 🚀 GO-LIVE — ALSHAM Forensic AI

Guia passo-a-passo para colocar a plataforma **no ar cobrando** os planos de análise forense
(Estudantil e Profissional em self-service; Institucional via contato comercial).
Tempo estimado: **~45–60 min** de configuração (o produto já está pronto; aqui só se conecta chaves e banco).

> **Regra de ouro:** nunca cole segredos reais em arquivos versionados. Tudo abaixo vai nas
> **Environment Variables da Vercel**, não no repositório.

> **Onde fica o app:** o app productionizado está na subpasta `alsham-forensic-ai/alsham-forensic-ai/`.
> Rode `npm install` / `npm run build` a partir dela. O schema SQL fica na raiz do repo
> (`alsham-forensic-schema.sql`). Configure a **Root Directory** da Vercel para essa subpasta.

---

## 0. Pré-requisitos (contas)

| Conta | Para quê | Obrigatória? |
|---|---|---|
| **Supabase** | banco (perfis, análises, certificados CID) + Auth | ✅ sim |
| **Anthropic** | motor de análise (Claude) | ✅ sim |
| **OpenAI** | embeddings / fallback de IA | ✅ sim |
| **Stripe** | cobrança dos planos + webhook | ✅ sim |
| **Resend** | e-mails transacionais | ✅ sim |
| **Vercel** | onde o app roda (Next.js) | ✅ sim |
| **Tavily** | verificação de citações (degrada com elegância se ausente) | ⚪ opcional |

---

## 1. Supabase — criar projeto e aplicar o schema (10 min)

1. Crie um projeto em **supabase.com** (região `sa-east-1` recomendada para BR).
2. Em **Settings → API**, copie:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** (secret) → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ nunca exponha no frontend)
3. Abra **SQL Editor → New query**, cole **todo** o conteúdo de `alsham-forensic-schema.sql`
   (raiz do repo) e rode. Ele cria as tabelas `plans`, `profiles`, `institutions`, `normatives`,
   `analyses`, `text_submission_history`, `citation_cache`, `reports`, `usage_events`,
   `stripe_events` e **as 2 funções obrigatórias**:
   - `increment_analyses_count(p_user_id UUID)` — incrementa o contador de uso do usuário.
   - `get_public_analysis_by_cid(p_cid TEXT)` — resolve o certificado público em `/verify/[cid]`.
4. Confirme no **Database → Functions** que as duas funções existem. Sem elas, o contador de
   análises e a página de verificação de certificado quebram.

---

## 2. Chaves de IA (5 min)

1. **Anthropic** → console.anthropic.com → API Keys → copie `sk-ant-...` → `ANTHROPIC_API_KEY`.
2. **OpenAI** → platform.openai.com → API Keys → copie `sk-...` → `OPENAI_API_KEY`.
3. (Opcional) **Tavily** → app.tavily.com → copie `tvly-...` → `TAVILY_API_KEY`.
   Sem essa chave, a verificação de citações é pulada sem quebrar a análise.

---

## 3. Stripe — produtos, preços e webhook (15 min)

1. No **Stripe Dashboard → Products**, crie os planos com preço recorrente (BRL):
   - **Estudantil** → copie o `price_...` → `STRIPE_PRICE_ESTUDANTIL`
   - **Profissional** → copie o `price_...` → `STRIPE_PRICE_PROFISSIONAL`
   - **Institucional** → **não precisa** de Payment/Checkout self-serve: na landing e no
     `/pricing`, o botão Institucional é um `mailto:comercial@alshamglobal.com.br`.
     `STRIPE_PRICE_INSTITUCIONAL` é opcional (o código lê a var, mas o fluxo não a aciona).
2. Copie as chaves em **Developers → API keys**:
   - **Secret key** → `STRIPE_SECRET_KEY` (`sk_live_...`)
   - **Publishable key** → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (`pk_live_...`)
3. Crie o **webhook** em **Developers → Webhooks → Add endpoint**:
   - URL: `https://SEU_DOMINIO/api/webhook/stripe`
   - Eventos: `customer.subscription.created`, `customer.subscription.updated`,
     `customer.subscription.deleted`, `invoice.payment_failed`.
   - Copie o **Signing secret** → `STRIPE_WEBHOOK_SECRET` (`whsec_...`).
4. O webhook lê `sub.metadata.plan_id` e atualiza `profiles.plan_id` (`estudantil`/`profissional`),
   grava `stripe_subscription_id`/`subscription_status`, e rebaixa para `free` no cancelamento.

---

## 4. Resend (5 min)

1. **resend.com → API Keys → Create** → copie `re_...` → `RESEND_API_KEY`.
2. **Verifique o domínio remetente** (ex.: `alshamglobal.com.br`) em **Domains** (registros DNS).
3. Defina o remetente → `RESEND_FROM_EMAIL` (ex.: `forense@alshamglobal.com.br`).

---

## 5. Variáveis de ambiente na Vercel (10 min)

**Vercel → projeto → Settings → Environment Variables** (Production). Nomes exatos (de `lib/env.ts`):

### Obrigatórias (o boot falha sem elas — ver `required[]` em `lib/env.ts`)

| Variável | Valor |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL do Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role key (secreta) |
| `ANTHROPIC_API_KEY` | `sk-ant-...` |
| `OPENAI_API_KEY` | `sk-...` |
| `STRIPE_SECRET_KEY` | `sk_live_...` |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_live_...` |
| `RESEND_API_KEY` | `re_...` |
| `NEXT_PUBLIC_APP_URL` | URL pública (ex.: `https://forensic.alshamglobal.com.br`) |

### Necessárias para cobrança (lidas em `lib/stripe.ts`)

| Variável | Valor |
|---|---|
| `STRIPE_PRICE_ESTUDANTIL` | `price_...` do plano Estudantil |
| `STRIPE_PRICE_PROFISSIONAL` | `price_...` do plano Profissional |
| `STRIPE_PRICE_INSTITUCIONAL` | `price_...` (opcional — Institucional é `mailto`, não self-serve) |

### Opcionais / recomendadas

| Variável | Valor |
|---|---|
| `RESEND_FROM_EMAIL` | remetente verificado (ex.: `forense@alshamglobal.com.br`) |
| `TAVILY_API_KEY` | `tvly-...` (verificação de citações; degrada sem ela) |

> ⚠️ `NEXT_PUBLIC_*` são embutidas no build — force um **Redeploy** após salvar.

---

## 6. Redeploy

Após salvar as variáveis, force um **Redeploy** na Vercel (Deployments → ⋯ → Redeploy).

---

## 7. Smoke test — o checklist que prova que vende (10 min)

Percorra o funil `try free (limitado) → parede → cadastro → pagamento`:

- [ ] Abrir o app → a landing carrega sem erro.
- [ ] **Analisar sem login** (anônimo): rodar uma análise. Repetir até bater o limite anônimo
      (**3 análises**, `ANON_ANALYSIS_LIMIT` em `lib/anon-limit.ts`) → deve aparecer a parede de cadastro.
- [ ] **Signup** → criar conta → o `profiles` é criado com `plan_id = free`.
- [ ] Rodar análises até bater o **limite do plano** → deve aparecer o upsell.
- [ ] Clicar em **assinar Profissional** → abre o **Checkout do Stripe**.
- [ ] Pagar em **modo Test** (cartão `4242 4242 4242 4242`, validade futura, CVC qualquer).
- [ ] ✅ **O webhook vira o plano:** em `profiles`, `plan_id` muda para `profissional` e
      `subscription_status` fica `active` (confira em Supabase → Table Editor).
- [ ] Gerar uma análise que emite **certificado CID** e abrir `/verify/[cid]` → o certificado
      **verifica** (usa `get_public_analysis_by_cid`).

Se todos passam, **o produto está vendável.** 🎉

---

## 8. Comercial — venda o Profissional primeiro

O plano **Profissional** é o carro-chefe de self-service — foque nele na comunicação e nos CTAs.
O **Estudantil** é a porta de entrada barata; o **Institucional** é venda consultiva por e-mail
(`comercial@alshamglobal.com.br`), com análises ilimitadas e normativas personalizadas.

---

## Troubleshooting rápido

| Sintoma | Causa provável | Correção |
|---|---|---|
| App não sobe / erro `Missing required environment variable` | falta uma var do `required[]` em `lib/env.ts` | preencher todas as obrigatórias + redeploy |
| Pagamento aprovado mas plano não muda | webhook não configurado ou `plan_id` ausente no metadata da subscription | conferir endpoint `/api/webhook/stripe` + `STRIPE_WEBHOOK_SECRET` |
| `/verify/[cid]` dá erro | função `get_public_analysis_by_cid` não foi criada | reaplicar o `alsham-forensic-schema.sql` |
| Contador de análises não incrementa | função `increment_analyses_count` ausente | reaplicar o schema |
| Verificação de citações silenciosamente pulada | `TAVILY_API_KEY` ausente | opcional — setar a chave se quiser o recurso |
| E-mail não chega | `RESEND_API_KEY` ausente ou domínio não verificado | configurar Resend (Passo 4) |

---

**Checklist de go-live:** schema + 2 funções ✅ · Supabase keys ✅ · Anthropic/OpenAI ✅ ·
Stripe (secret/webhook/publishable + 2 prices) ✅ · Resend ✅ · env na Vercel ✅ · redeploy ✅ ·
smoke test (anon limit → checkout → webhook flip → CID verifica) ✅ → **vendendo.**
