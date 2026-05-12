# ALSHAM_DESIGN_DOSSIE.md
# Dossiê de Design — ALSHAM Forensic AI
# ALSHAM Global Commerce Ltda · Documento Confidencial

---

## Posicionamento de Marca

**Conceito central:** "Forensic Authority, Quiet Power."

Você não deve vender "detecção". Você deve vender **"evidência defensável"**.

O ALSHAM ajuda programas de pós-graduação, pesquisadores, orientadores e
instituições a validar autoria, reduzir risco regulatório e emitir prova
verificável. Isso é muito mais valioso do que um score de IA.

### Arquétipo visual
- 50% institucional premium
- 25% forense técnico
- 15% produto SaaS de alta performance
- 10% luxo discreto

### Referências de marca
- Stripe — escala, dados, credibilidade, blocos enterprise
- Linear — silêncio visual, premium minimalista
- Vercel — produto técnico com densidade elegante
- Clio — confiança em LegalTech, clareza comercial
- Regula Forensics — estética forense, geometria precisa, autoridade silenciosa

---

## Paleta Oficial — Forensic Sovereign (USAR ESTA)

```css
:root {
  /* Brand / Core */
  --ink-950:        #08111F;
  --ink-900:        #0C1628;
  --surface-800:    #101D33;
  --surface-700:    #162540;
  --surface-600:    #1B2A4A;

  /* Accent */
  --brand-gold:     #C7A24A;
  --gold-hover:     #D7B867;
  --brand-blue:     #5B8CFF;

  /* Text */
  --text-primary:   #F5F7FB;
  --text-secondary: #A2AEC2;
  --text-muted:     #7E8BA3;

  /* Signals */
  --status-success: #18B26B;
  --status-warning: #D79B2F;
  --status-danger:  #E15454;
  --status-info:    #4DA3FF;

  /* Borders */
  --border-strong:  #2B3B57;
  --border-soft:    #1E2B42;

  /* Background FX */
  --glow-blue:      rgba(91, 140, 255, 0.12);
  --glow-gold:      rgba(199, 162, 74, 0.10);

  /* Semantic aliases */
  --bg-app:         var(--ink-950);
  --bg-surface:     var(--surface-800);
  --bg-elevated:    var(--surface-700);
}
```

### Regra de uso
- 70% Ink + Surface (fundos e painéis)
- 15% Text Primary/Secondary (leitura)
- 10% Gold (selos, CTAs, highlights de números, CID)
- 5% Blue + status colors

**Nunca hardcode hex nos componentes. Sempre usar as variáveis CSS.**

O dourado funciona como **selo de autoridade**, não como tema inteiro.
Use em: CID, headers-chave, CTAs prioritários, score numbers, assinatura visual.

---

## Paletas Alternativas (não usar agora)

### Institutional Graphite (mais enterprise B2B)
```
Charcoal 950  #0B0F16
Charcoal 900  #111827
Panel 800     #182131
Steel 700     #243042
Platinum      #D8DEE8
Signal Gold   #B9973E
Signal Blue   #4B7CFF
```

### Nordic Precision (mais Oxford/MIT)
```
Midnight      #091523
Panel         #10213A
Deep Blue     #163154
Ice           #EAF1FA
Soft Gold     #C8AA62
Trust Blue    #3D8BFF
```

---

## Tipografia

### Combinação obrigatória
- **Headlines:** Geist (next/font/google) ou Inter weight 600/700
- **Body / UI:** Inter, 400/500
- **Dados técnicos / CID / hash / métricas / normativas:** IBM Plex Mono

### Escala tipográfica
```
H1:      56–72px, weight 700, tracking -0.03em
H2:      36–48px, weight 600
H3:      24–32px, weight 600
Body L:  18px / line-height 1.6
Body M:  16px / line-height 1.65
Label:   12–13px, uppercase APENAS em contextos técnicos forenses
Mono:    14px para CID, hash, scores, logs, datas, normativas
```

### Regra do Mono
O monospace é **ritual**, não padrão.
Usar APENAS em: CID codes, hash SHA-256, scores numéricos,
timestamps, artigos de normativas (ex: "Art. 9º, I, d").
Nunca usar mono em textos corridos ou labels genéricos.

---

## Ícones

### Base: Lucide React (já instalado)
Manter Lucide como base. Criar 12 componentes SVG proprietários
para os ícones forenses críticos.

### Estilo
- Outline limpo, stroke 1.75–2px
- Cantos suaves (round caps)
- Nada de 3D, glossy ou robótico
- Duotone apenas em marketing, nunca no dashboard

### Ícones proprietários ALSHAM (criar como componentes)
```
CidSeal              → identificação do certificado
HashVerification     → verificação SHA-256
StylometricScan      → análise linguística
NormativeShield      → conformidade institucional
InstitutionalBadge   → seletor de instituição
ResubmissionTrail    → histórico de reenvio
BibliographicCheck   → verificação de citações
ForensicReport       → laudo PDF
PublicVerificationQR → QR da verify page
ChainOfCustody       → trilha de auditoria
AiFingerprint        → modelo detectado
RiskEscalation       → nível de risco
```

### Fallback Lucide
```
ShieldCheck, BadgeCheck, Fingerprint, ScanText,
SearchCheck, FileBadge, Building2, Hash, QrCode,
BookCheck, History, AlertOctagon, LockKeyhole
```

---

## Componentes visuais obrigatórios

```
HeroEvidencePanel       landing hero com dashboard screenshot
TrustRail               faixa com 5 diferenciais (normativas, CID, hash...)
InstitutionSelector     busca em tempo real com badge de rigor
ForensicScoreGauge      semicírculo SVG animado com animação 600ms
ComplianceBanner        banner colorido por nível de risco
ParagraphHeatmap        barras de risco por parágrafo com score
CitationVerificationList lista com badges Scholar + risco bibliográfico
CIDCard                 cartão premium com código, hash, QR, download
VerifyCertificateCard   página pública — certificado digital premium
PricingComparisonGrid   grade de planos com destaque no Profissional
InstitutionalUseCases   bloco B2B para coordenações e programas
AuditTrailTimeline      histórico de reenvios do usuário
```

---

## Layout das Páginas

### globals.css — obrigatório
```css
body {
  background: var(--ink-950);
  color: var(--text-primary);
  font-family: 'Inter', system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
}

code, .mono, .cid, .hash, .score-value, .normative-code {
  font-family: 'IBM Plex Mono', 'Courier New', monospace;
}

/* Radial glow — aplicar nos heroes e headers */
.glow-blue { background: radial-gradient(ellipse at 60% 0%, var(--glow-blue), transparent 70%); }
.glow-gold  { background: radial-gradient(ellipse at 40% 100%, var(--glow-gold), transparent 70%); }
```

### Border radius
```
Cards externos:   20px
Cards internos:   16px
Inputs:           12px
Pills / badges:   999px
Botões:           10px
```

### Espaçamento base (Tailwind)
```
4, 8, 12, 16, 24, 32, 48, 64, 96
```

### Motion
```
Hover transitions:  150–180ms ease
Panel enter:        220ms ease-out
Score gauge fill:   600–900ms ease-in-out
```

---

## Dashboard — Layout 3 Colunas (OBRIGATÓRIO)

```
┌─────────────────────────────────────────────────────────┐
│  NAVBAR                                                  │
├──────────────┬──────────────────────────┬───────────────┤
│              │                          │               │
│  INPUT       │  SCORE + COMPLIANCE      │  HISTÓRICO    │
│  PANEL       │  FORENSIC SUMMARY        │  RECENTE      │
│  (fixo)      │  PARAGRAPH HEATMAP       │               │
│              │  STYLOMETRIC METRICS     │  CID          │
│  Textarea    │  CITATION VERIFICATION   │  EMITIDOS     │
│  Instituição │  FLAGS                   │               │
│  Limites     │  RESUBMISSION ALERT      │  ALERTAS      │
│  do plano    │  PASTE ALERT             │               │
│  Botão       │  CID CERTIFICATE         │  UPGRADE      │
│  Analisar    │  + PDF DOWNLOAD          │  CTA          │
│              │                          │               │
└──────────────┴──────────────────────────┴───────────────┘
```

### Ordem visual obrigatória no centro
1. Score Gauge + Verdict badge
2. Compliance institucional (banner colorido)
3. Forensic Summary (texto legal)
4. Paragraph Heatmap
5. Stylometric Metrics (5 cards)
6. Bibliographic Verification (com links Scholar)
7. Flags detectadas (badges)
8. Resubmission/Paste alerts (se presentes)
9. CID Certificate (cartão premium + download + link público)

---

## Landing Page — Estrutura

### Seções em ordem
1. **Hero** — headline, subheadline jurídica, 2 CTAs, screenshot do dashboard
2. **Trust Rail** — 5 diferenciais: Normativas, CID, SHA-256, Scholar, Dosimetria
3. **Demo Interativo** — textarea + seletor + output resumido + CTA de upgrade
4. **Como Funciona** — 5 etapas visuais do processo forense
5. **Comparativo** — ALSHAM vs GPTZero vs Turnitin vs Copyleaks
6. **Bloco Institucional** — para coordenações, orientadores, programas de pós
7. **Pricing** — 4 planos, Profissional em destaque, Institucional como "sales-assisted"
8. **FAQ** — segurança, validade, falsos positivos, privacidade
9. **CTA Final** — "Analisar gratuitamente" + "Solicitar demonstração institucional"

### Copy obrigatória
```
Headline:     "A auditoria forense de IA que universidades conseguem defender."
Subheadline:  "Detecte texto sintético, valide citações, aplique normativas reais
               e emita um Certificado de Integridade Digital verificável."
CTA 1:        "Analisar gratuitamente"
CTA 2:        "Solicitar plano institucional"
```

### Headlines secundárias (usar nas seções)
- "Mais do que detectar IA: produzir evidência"
- "Conformidade acadêmica com rastreabilidade pública"
- "Do score ao certificado verificável"
- "A plataforma forense para programas de pós-graduação"
- "Valide autoria, citações e risco institucional em um só fluxo"

---

## Verify Page — Certificado Público

Esta é a página mais valiosa do produto. Tratar como
**página de autenticação documental**, não página utilitária.

### Layout
- Fundo limpo (--ink-950)
- Cartão central branco/surface com borda dourada sutil
- Selo "DOCUMENTO VERIFICADO" em destaque (verde) ou "ALERTA DE FRAUDE" (vermelho)
- Score, veredito, modelo, instituição, data
- Campo de verificação de hash (textarea + botão)
- QR code + botão de copiar link + compartilhar
- Rodapé institucional minimalista

---

## O que NUNCA fazer

```
✗ Gradientes neon
✗ Cérebros / robôs / rostos de IA genéricos
✗ Excesso de vermelho na homepage
✗ 12 cards competindo acima da dobra
✗ Carrossel automático
✗ Stock photo sorridente genérica
✗ Muito texto jurídico logo no hero
✗ Excesso de ALL CAPS
✗ Brilho cyberpunk
✗ Glassmorphism exagerado
✗ Hex hardcoded nos componentes
✗ Mono em textos corridos
✗ Inline styles (usar className + CSS variables)
```

---

## Checklist de Implementação

- [ ] globals.css com todas as CSS variables da paleta Forensic Sovereign
- [ ] font Inter (body) + IBM Plex Mono (dados) configurados via next/font
- [ ] Zero hex hardcoded — todos os componentes usando variáveis
- [ ] Layout 3 colunas no dashboard analyze
- [ ] Verify page elevada a certificado premium
- [ ] Landing com as 9 seções e copy oficial
- [ ] 12 ícones proprietários criados como componentes SVG
- [ ] ScoreGauge com animação 600ms
- [ ] CIDCard com QR, hash, download PDF
- [ ] Trust Rail na landing
- [ ] Radial glow nos heroes (--glow-blue e --glow-gold)
- [ ] Motion: hover 150ms, panel 220ms, score 600ms
