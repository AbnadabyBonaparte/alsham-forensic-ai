# ALSHAM FORENSIC AI — Arquitetura & Estratégia
## ALSHAM Global Commerce Ltda · Documento Confidencial

---

## 1. DIAGNÓSTICO DE MERCADO

| Concorrente | ARR (2025) | Usuários | Preço | Brecha |
|---|---|---|---|---|
| Turnitin | $203M | 71M estudantes | Institucional | Caixa-preta, sem conformidade normativa |
| GPTZero | $24M | 4M | $10–46/mês | ESL false positives, sem normativas brasileiras |
| Originality.ai | ~$5M est. | corporativo | $12.95/mês | Foco em SEO/marketing, não acadêmico |
| Winston AI | ~$3M est. | nicho | $12–19/mês | Sem API, sem normativas institucionais |
| **ALSHAM** | **0 → target** | **0 → target** | **R$29–497/mês** | **Único com CNPq/UFPB + CID forense** |

**Mercado total:** $142M em 2025 → $13.68B projetado 2035 (34% a.a.)
**Mercado brasileiro:** ~8M de estudantes de pós-graduação. CNPq financiou 80.000+ bolsas em 2024.

---

## 2. POSICIONAMENTO

> "O único sistema de auditoria forense de IA que emite laudos com referência à **Portaria CNPq 2664/2026** e à **Resolução UFPB 57/2025** — aceito como evidência em processo administrativo universitário."

**Diferencial indefensável:**
- Normativas reais citadas por artigo — nenhum concorrente faz isso
- Certificado CID com hash SHA-256 — verificável publicamente
- Detecção de tentativa de burla (dosimetria de sanção)
- Motor ensemble: Claude + GPT + Tavily em tempo real

---

## 3. TECH STACK

```
Frontend          Next.js 15 (App Router, TypeScript, Server Components)
UI                Tailwind CSS + shadcn/ui + Padrão ALSHAM
Auth              Supabase Auth (email/senha + OAuth Google)
Database          Supabase PostgreSQL (sa-east-1 São Paulo)
Storage           Supabase Storage (PDFs dos certificados)
AI Principal      Anthropic Claude (claude-sonnet-4-20250514)
AI Secundário     OpenAI GPT-4o-mini (ensemble calibration)
Busca Citações    Tavily API (real-time web search)
Pagamentos        Stripe (BRL + USD)
Email             Resend
PDF               @react-pdf/renderer
Deploy            Vercel (Edge Network)
DNS               Cloudflare
Domínio           forensic.alshamglobal.com.br
```

---

## 4. ARQUITETURA DO MOTOR DE ANÁLISE

```
Texto do usuário
      │
      ├─► SHA-256 hash → checar resubmissão (Supabase)
      │
      ├─► Detecção de paste (event listener)
      │
      ▼
[ENSEMBLE ENGINE]
      │
      ├─► Claude claude-sonnet-4 (70% weight)
      │     ├── Estilometria + perplexidade
      │     ├── Fingerprinting de LLM
      │     ├── Detecção de tradução reversa
      │     ├── Extração de citações
      │     └── Conformidade com normativas
      │
      ├─► GPT-4o-mini (30% weight)
      │     └── Score de calibração independente
      │
      └─► Tavily Search (async)
            └── Verificação de cada citação em tempo real
                  ├── Scholar / PubMed / CrossRef / SciELO
                  └── Risk level: low | medium | critical
      │
      ▼
[RESULTADO CONSOLIDADO]
      │
      ├─► Score ensemble (ponderado)
      ├─► Conformidade com normativas (banco Supabase)
      ├─► Geração do CID
      ├─► Salvar no banco
      └─► Retornar ao cliente
```

---

## 5. SCHEMA DE BANCO DE DADOS

### Tabelas principais:
- `plans` — planos e preços
- `profiles` — usuários (extends auth.users)
- `institutions` — 11 instituições pré-configuradas
- `normatives` — cláusulas reais das portarias
- `analyses` — cada análise realizada
- `text_submission_history` — histórico por hash (detecção de burla)
- `citation_cache` — cache de verificações (30 dias)
- `reports` — PDFs gerados
- `usage_events` — telemetria
- `stripe_events` — webhooks

### Funções SQL:
- `check_resubmission()` — detecta burla por reenvio
- `reset_monthly_analyses()` — reseta cota mensal
- `handle_new_user()` — cria profile no signup

---

## 6. PLANOS E PREÇOS

| Plano | BRL/mês | USD/mês | Análises | Chars | PDF | API | Scholar |
|---|---|---|---|---|---|---|---|
| Gratuito | R$0 | $0 | 3 | 2.000 | ✗ | ✗ | ✗ |
| Estudantil | R$29,90 | $5,99 | 30 | 8.000 | ✗ | ✗ | ✓ |
| Profissional | R$89,90 | $17,99 | 150 | 20.000 | ✓ | ✗ | ✓ |
| Institucional | R$497,00 | $99,00 | ∞ | 50.000 | ✓ | ✓ | ✓ |

**Projeção conservadora:**
- Mês 3: 100 pagantes → R$5.000/mês
- Mês 6: 300 pagantes → R$18.000/mês
- Mês 12: 1.000 pagantes → R$65.000/mês
- Mês 24: 5.000 pagantes → R$350.000/mês

---

## 7. GO-TO-MARKET — 90 DIAS

### Semana 1–2: Lançamento Técnico
- Deploy em forensic.alshamglobal.com.br
- Testar com 10 textos reais de dissertações
- Ajustar limites de falso positivo

### Semana 3–4: Prova Social
- Publicar 3 casos de uso no LinkedIn/Twitter:
  "Submetemos um texto gerado pelo ChatGPT para nossa ferramenta — veja o laudo"
- Contato direto com professores de pós-graduação no LinkedIn

### Mês 2: Canais
- Grupos de mestrandos/doutorandos no Facebook e WhatsApp
- Parceria com orientadores que precisam de ferramenta para verificar trabalhos
- Anúncio no Currículo Lattes thread

### Mês 3: Institucional
- Contato B2B com coordenações de pós-graduação (UFPB, UFC, UFCE)
- Proposta de plano Institucional para 10 departamentos = R$4.970/mês

---

## 8. CHECKLIST DE ATIVAÇÃO

### Antes do deploy:
- [ ] Resolver fatura pendente Supabase (app.supabase.com/org/ixgepvorquimksafpwoe/billing)
- [ ] Criar projeto Supabase `alsham-forensic-ai` em sa-east-1
- [ ] Aplicar `schema.sql` no Supabase SQL Editor
- [ ] Criar produtos no Stripe (3 planos)
- [ ] Configurar domínio Resend: `envio.alshamglobal.com.br`
- [ ] Obter chave Tavily API (tavily.com — free tier: 1000 req/mês)
- [ ] Criar repositório GitHub: `AbnadabyBonaparte/alsham-forensic-ai`
- [ ] Executar `CLAUDE_CODE_PROMPT.md` no Claude Code (1 sessão)
- [ ] Configurar variáveis de ambiente no Vercel
- [ ] Configurar DNS: `forensic.alshamglobal.com.br → Vercel`

### Após deploy:
- [ ] Teste end-to-end: análise → pagamento → PDF → verificação CID
- [ ] Configurar Stripe webhook: `/api/webhook/stripe`
- [ ] Habilitar Supabase Auth email templates (Resend)
- [ ] Google Analytics 4 + Vercel Analytics
- [ ] Configurar alertas de erro (Vercel logs)

---

## 9. VANTAGEM COMPETITIVA DEFENSÁVEL

**Por que é difícil copiar:**
1. O banco de normativas (CNPq, UFPB e futuras) leva tempo para construir e manter
2. O CID com hash SHA-256 e verificação pública cria um standard — quem usar o produto uma vez vai querer que seus trabalhos tenham o selo ALSHAM
3. O histórico de análises por usuário cria um "prontuário forense" que cresce com o tempo
4. Integração futura com CAPES/Sucupira pode criar barreira regulatória

**Próximas normativas a mapear:**
- USP: Resolução CoPGr 8080 (em revisão para incluir IA)
- UFRJ: Instrução Normativa pós-graduação 2025
- CAPES: Portaria sobre avaliação de programas com uso de IA (esperada 2026)
- Portugal: regulamentação FCT sobre IA em projetos de investigação
