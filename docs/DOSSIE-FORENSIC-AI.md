# 🔬 DOSSIÊ — ALSHAM FORENSIC AI

> ⛔ **DOCUMENTO INTERNO — NÃO PUBLICAR.**
> Contém arquitetura, variáveis de ambiente e o plano de go-live.
> Destino: `docs/internal/` ou fora do repositório. **Nunca em `public/`.**

> **Data:** 22 de julho de 2026
> **Método:** verificado por leitura do repositório, do schema SQL e **busca em todos os 12 bancos** da organização. Lei 7 aplicada.
> **Veredito de uma linha:** é o produto **mais bem construído e mais bem precificado** da ALSHAM — e o único que **não pode funcionar**, porque o banco de dados nunca foi criado.

---

## 1. O QUE É

**Auditoria forense de IA para universidades — com evidência, não só com score.**

Detecta texto sintético, valida citações contra normativas reais e emite um **Certificado de Integridade Digital (CID)** com hash SHA-256 verificável publicamente.

**Posicionamento:** *"A auditoria forense de IA que universidades conseguem defender."*
A diferença para GPTZero/Turnitin não é a detecção — é a **produção de evidência defensável** em processo administrativo.

### O fluxo do produto
```
1. Cola o texto        → detecção automática de paste + hash SHA-256
2. Seleciona a instituição → 11 instituições com normativas mapeadas
3. Análise ensemble    → motor forense multi-modelo em paralelo
4. Laudo jurídico      → conformidade citada por artigo, citações verificadas
5. Certificado CID     → hash + QR verificável publicamente, download em PDF
```

**Conformidade declarada:** CNPq 2664/2026 · UFPB 57/2025

### Diferenciais na tabela comparativa do site
Normativas CNPq · Certificado CID com SHA-256 · verificação pública de hash · **detecção de burla por reenvio** · links Google Scholar · motor ensemble dual · preços em BRL

---

## 2. ONDE ESTÁ

| | |
|---|---|
| **Repo GitHub** | `alsham-forensic-ai` |
| **Projeto Vercel** | `alsham-forensic-ai` — último deploy de produção **READY** |
| **Domínio publicado** | `forensic.ai.alshamglobal.com.br` ✅ vivo (subdomínio de 4 níveis, separador **ponto**) |
| **URL alternativa** | `alsham-forensic-ai.vercel.app` ✅ viva |
| **Banco Supabase** | 🔴 **NÃO EXISTE** — ver §5 |

---

## 3. PREÇOS PUBLICADOS — os mais claros do catálogo

| Plano | Preço | Limite |
|---|---|---|
| **Gratuito** | R$ 0 | 3 análises/mês · até 2.000 caracteres |
| **Estudantil** | **R$ 29,90/mês** | 30 análises/mês · até 8.000 caracteres |
| **Profissional** ⭐ | **R$ 89,90/mês** | 150 análises/mês · até 20.000 caracteres |
| **Institucional** | **R$ 497,00/mês** | análises ilimitadas · até 50.000 caracteres · API REST · SLA |

👉 **É o único produto ALSHAM com escada de preço fechada e publicada.** Todos os outros são "sob consulta" ou beta.

**Isca de conversão bem desenhada:** 3 análises grátis **sem cadastro e sem cartão**, com paywall no 4º uso — controlado por cookie assinado com **HMAC**.

---

## 4. A ARQUITETURA — completa e profissional

### Schema (7 tabelas)
```
public.plans                    → catálogo de planos
public.profiles                 → usuários
public.institutions             → as 11 instituições com normativas
public.normatives               → as normativas (CNPq, UFPB…)
public.analyses                 → as análises realizadas
public.text_submission_history  → histórico p/ detectar reenvio (a burla)
public.stripe_events            → idempotência do webhook
```

### RLS — **11 políticas, bem desenhadas**
Três delas são `USING(true)` — **e isso está correto**: estão nas tabelas de **catálogo público** (`plans`, `institutions`, `normatives`), que precisam ser legíveis por qualquer visitante para a página de preços funcionar.

> ⚠️ **Não confundir com o `suna-core`**, onde `USING(true)` está em `api_keys`, `transactions` e `users` — ali é falha; aqui é desenho.

### Funções (4)
| Função | Papel |
|---|---|
| `handle_new_user` | cria o profile ao cadastrar |
| `increment_analyses_count` | contabiliza uso contra o limite do plano |
| `check_resubmission` | **detecta burla por reenvio** — o diferencial do produto |
| `get_public_analysis_by_cid` | permite a verificação pública do certificado |

### Rotas de API (5)
```
/api/analyze                 → o motor forense
/api/generate-report         → o laudo/certificado
/api/stripe/create-checkout  → assinatura
/api/stripe/portal           → gestão da assinatura pelo cliente
/api/webhook/stripe          → confirmação de pagamento (com stripe_events p/ idempotência)
```

### Motores externos
| Serviço | Papel |
|---|---|
| **Anthropic** | motor forense primário |
| **OpenAI** | calibrador do ensemble (segunda opinião) |
| **Tavily** | verificação de citação — *opcional, degrada com elegância* |
| **Stripe** | cobrança (3 price IDs, um por plano) |
| **Resend** | e-mail transacional |

---

## 5. 🔴 O BLOQUEADOR — o banco de dados não existe

### O que foi verificado
A organização Supabase **ALSHAM GLOBAL** (única existente) tem **12 projetos**. Nenhum deles contém as tabelas do Forensic.

Busquei `analyses`, `normatives`, `institutions`, `text_submission_history`, `stripe_events` e `plans` em:
`alsham-core` · `alsham-events-os` · `alsham-suprema-beleza` · `casa-bonaparte` · `suna-core` · `ALSHAM-DEV-OS` · `ALSHAM_MPC_CORE` · `peritus` · `kraken-v2` · `cognitive-mirror-ai`

**Resultado: não estão em lugar nenhum.**

### O próprio repo confirma
`docs/GO-LIVE.md`:
> *"O schema vive em `supabase/migrations/` e `supabase/seed.sql`; **aplicá-las é o único bloqueador rígido para o go-live (sem elas nada persiste)**."*

### Por que o site parece funcionar
O app foi escrito para **degradar, não quebrar** (`lib/env.ts`, `lib/supabase/client.ts`, `middleware.ts`). Sem as variáveis de ambiente, a página **continua no ar** — só as funcionalidades falham silenciosamente.

👉 **Consequência comercial:** o site mais convincente do catálogo — com preço, comparativo e conformidade — recebe visitante que clica em "Analisar gratuitamente" ou "Criar Conta" e **não consegue usar nada**.

---

## 6. 💎 O OURO DESTE SISTEMA

1. **Nicho defensável** — não compete em "detectar IA" (mercado saturado); compete em **produzir evidência defensável** em processo administrativo. Comprador institucional, dor cara.
2. **Preço fechado e escalonado** — o único do catálogo. Não exige reunião para vender.
3. **Funil desenhado** — 3 grátis sem cartão → paywall no 4º → assinatura. Conversão embutida no produto.
4. **A burla já está prevista** — `check_resubmission` e `text_submission_history` resolvem o problema que derruba concorrente: aluno reenviar texto até passar.
5. **Verificação pública do certificado** — `get_public_analysis_by_cid` permite a universidade conferir o hash sem depender da ALSHAM. É o que torna o laudo defensável.
6. **Runbook pronto** — o `GO-LIVE.md` já documenta cada variável e a ordem das migrations.

---

## 7. ▶️ PROMPT PARA DESTRAVAR — criar o banco e rodar as migrations

> Colar no Claude Code quando for retomar este sistema.

```
═══ VERTEX — PORTÃO OBRIGATÓRIO ═══
LEIA e confirme: casa-bonaparte-saas/canon/CONSTITUICAO.md (Lei 7) ·
canon/mundos/BANCO-DO-UNIVERSO.md · alsham-forensic-ai/docs/GO-LIVE.md
═══════════════════════════════════

DESTRAVAR O ALSHAM FORENSIC AI — criar o banco e aplicar o schema.

CONTEXTO PROVADO: o repo `alsham-forensic-ai` está completo (schema, RLS, funções, Stripe,
rotas, runbook), mas o BANCO DE DADOS NUNCA FOI CRIADO. Busca em todos os 12 projetos da
organização ALSHAM GLOBAL não encontrou nenhuma das 7 tabelas. O próprio GO-LIVE.md declara:
"aplicá-las é o único bloqueador rígido para o go-live (sem elas nada persiste)".

1. CRIAR o projeto Supabase
   • Nome: `alsham-forensic` · Organização: ALSHAM GLOBAL
   • Região: `sa-east-1` (mesma dos demais — latência para o Brasil)
   • ⚠️ CONFIRMAR O CUSTO com o Fundador ANTES de criar. Não criar sem autorização explícita.

2. APLICAR as migrations NA ORDEM (o GO-LIVE.md manda; a ordem importa):
   a) supabase/migrations/20260713000000_init_schema.sql   → 7 tabelas
   b) supabase/migrations/20260713000100_rls_policies.sql  → 11 políticas
   c) supabase/migrations/20260713000200_functions.sql     → 4 funções
   d) supabase/seed.sql                                    → planos, instituições, normativas
   Reportar o resultado de cada passo. Se alguma falhar, PARAR e reportar — não improvisar.

3. VERIFICAR (prova obrigatória, não aceitar "aplicado" sem isto):
   • as 7 tabelas existem
   • RLS LIGADA em todas
   • as 11 políticas criadas — confirmar que os 3 `USING(true)` estão SOMENTE em
     plans/institutions/normatives (catálogo público). Se aparecer USING(true) em
     `analyses`, `profiles` ou `stripe_events`, PARE E REPORTE — seria falha grave.
   • as 4 funções existem
   • o seed populou planos, instituições e normativas

4. CONFIGURAR as variáveis na Vercel (lista completa no GO-LIVE.md §1):
   NEXT_PUBLIC_SUPABASE_URL · NEXT_PUBLIC_SUPABASE_ANON_KEY · SUPABASE_SERVICE_ROLE_KEY ·
   ANTHROPIC_API_KEY · OPENAI_API_KEY · TAVILY_API_KEY (opcional) ·
   STRIPE_SECRET_KEY · STRIPE_WEBHOOK_SECRET · NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ·
   STRIPE_PRICE_ESTUDANTIL · STRIPE_PRICE_PROFISSIONAL · STRIPE_PRICE_INSTITUCIONAL ·
   RESEND_API_KEY · RESEND_FROM_EMAIL · NEXT_PUBLIC_APP_URL · ANON_COOKIE_SECRET
   ⚠️ NUNCA versionar chave no repo. Só env da Vercel.
   ⚠️ Os 3 price IDs exigem criar os produtos no Stripe antes (R$29,90 / 89,90 / 497).

5. TESTE DE PONTA A PONTA (reportar cada um):
   • uma análise anônima grava em `analyses`
   • o contador de cota anônima funciona e o paywall aparece no 4º uso
   • cadastro cria profile (`handle_new_user`)
   • checkout Stripe → webhook grava em `stripe_events` e atualiza o profile
   • o CID gerado é verificável publicamente (`get_public_analysis_by_cid`)
   • reenvio do mesmo texto é detectado (`check_resubmission`)

NÃO mergear nada sem revisão. Reportar com prova (query + resposta HTTP), nunca "deve funcionar".
```

---

## 8. O QUE FALTA / RISCOS

| Item | Situação |
|---|---|
| 🔴 **Banco não existe** | bloqueador absoluto — nada persiste |
| 🔴 **Produtos Stripe** | os 3 price IDs precisam ser criados antes |
| ⚠️ **Chaves de IA** | Anthropic e OpenAI precisam estar no env (e com saldo) |
| ⚠️ **Custo do projeto Supabase** | criar projeto tem custo — confirmar com o Fundador |
| ⚠️ **Site vendendo sem entregar** | enquanto não destravar, visitante clica e nada acontece — considerar aviso de "em breve" ou lista de espera |
| ⚠️ **Conformidade citada** | CNPq 2664/2026 e UFPB 57/2025 aparecem como normativas — confirmar que são reais e vigentes (Lei 7) |
| ⚠️ **Responsabilidade do laudo** | o FAQ já ressalva ("resultado probabilístico, não substitui perícia oficial") — bom; manter sempre |

---

## 9. EM UMA FRASE

> **O Forensic AI é o produto mais bem construído da ALSHAM — nicho defensável, preço fechado, funil desenhado, burla prevista e certificado verificável — e está a uma criação de banco de distância de funcionar. É o menor esforço com o maior retorno do catálogo inteiro.**

---

*Dossiê produzido em 22/jul/2026 por verificação direta (repo + schema + busca nos 12 bancos).*
*Documento vivo — atualizar após a criação do banco e o primeiro teste ponta a ponta.*
*© ALSHAM GLOBAL — **uso interno, não publicar**.*
