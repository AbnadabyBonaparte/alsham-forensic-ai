import Link from 'next/link'
import { CheckCircle, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { HeroArt } from '@/components/landing/HeroArt'
import {
  NormativeShield, CidSeal, HashVerification,
  BibliographicCheck, RiskEscalation,
  StylometricScan, AiFingerprint, ForensicReport,
} from '@/components/icons'

const HOW_ICONS = [AiFingerprint, NormativeShield, StylometricScan, ForensicReport, CidSeal]

const TRUST_ITEMS = [
  { Icon: NormativeShield, label: 'Normativas CNPq 2664/2026 e UFPB 57/2025' },
  { Icon: CidSeal,         label: 'Certificado de Integridade Digital (CID)' },
  { Icon: HashVerification,label: 'Hash SHA-256 público e verificável' },
  { Icon: BibliographicCheck, label: 'Citações verificadas em tempo real' },
  { Icon: RiskEscalation,  label: 'Dosimetria de sanção por reenvio' },
]

const HOW_STEPS = [
  { n: '01', title: 'Cole o texto',           desc: 'Textoarea com detecção automática de paste e hash SHA-256.' },
  { n: '02', title: 'Selecione a instituição', desc: '11 instituições com normativas reais mapeadas.' },
  { n: '03', title: 'Análise ensemble',        desc: 'Motor forense ALSHAM com ensemble multi-modelo em paralelo.' },
  { n: '04', title: 'Laudo jurídico',          desc: 'Conformidade citada por artigo, citações verificadas.' },
  { n: '05', title: 'Certificado CID',          desc: 'Hash + QR verificável publicamente. Download PDF.' },
]

const COMPARISON = [
  { feat: 'Normativas CNPq 2664/2026',     al: true,  gz: false, tt: false, or: false },
  { feat: 'Certif. CID com SHA-256',        al: true,  gz: false, tt: false, or: false },
  { feat: 'Verificação pública de hash',  al: true,  gz: false, tt: false, or: false },
  { feat: 'Detecção de burla por reenvio', al: true,  gz: false, tt: false, or: false },
  { feat: 'Links Google Scholar',           al: true,  gz: true,  tt: false, or: false },
  { feat: 'Motor ensemble dual',            al: true,  gz: false, tt: false, or: true  },
  { feat: 'Preços em BRL',                  al: true,  gz: false, tt: false, or: false },
]

const FAQ = [
  { q: 'O resultado tem valor jurídico?', a: 'O laudo cita artigos específicos de portarias federais (CNPq) e resoluções institucionais, e o CID com hash SHA-256 pode servir como evidência de apoio em processo administrativo — sempre sujeita a revisão humana. É um resultado probabilístico, não substitui perícia oficial nem constitui prova pericial definitiva.' },
  { q: 'Falsos positivos são possíveis?',      a: 'Sim — todo sistema de detecção tem taxa de erro. O ALSHAM usa um ensemble multi-modelo proprietário + estilometria para reduzir esse risco, mas nenhum resultado é definitivo. Sempre revise com o contexto do autor.' },
  { q: 'Os textos são armazenados?',           a: 'Apenas o hash SHA-256 e a prévia (200 chars) são salvos para emissão do CID. O texto completo nunca é retido.' },
  { q: 'Funciona para outras línguas?',        a: 'Sim. O motor forense ALSHAM analisa português, inglês e espanhol, sempre com a mesma ressalva de margem de erro.' },
]

export default function LandingPage() {
  return (
    <div style={{ background: 'var(--bg-app)', color: 'var(--text-primary)', minHeight: '100vh' }}>

      {/* ─────────── HERO (cinematic) ─────────── */}
      <section className="hero-cinematic" style={{ minHeight: '92vh', display: 'flex', alignItems: 'center', padding: '132px 24px 96px' }}>
        {/* layered depth: focal art → glow → vignette → grain (last two via ::after / .hero-vignette) */}
        <HeroArt />
        <div className="hero-glow" aria-hidden />
        <div className="hero-vignette" aria-hidden />

        <div style={{ position: 'relative', zIndex: 4, maxWidth: 940, margin: '0 auto', textAlign: 'center' }}>
          <div className="rise rise-1" style={{
            display: 'inline-flex', alignItems: 'center', gap: 9,
            background: 'color-mix(in srgb, var(--surface-700) 70%, transparent)',
            border: '1px solid color-mix(in srgb, var(--brand-gold) 34%, transparent)',
            backdropFilter: 'blur(8px)',
            borderRadius: 999, padding: '7px 16px', marginBottom: 30,
            boxShadow: '0 8px 30px -18px rgba(199,162,74,0.5)',
          }}>
            <span style={{ display: 'inline-flex', width: 7, height: 7, borderRadius: 999, background: 'var(--brand-gold)', boxShadow: '0 0 10px var(--brand-gold)' }} />
            <span style={{ fontSize: 10.5, color: 'var(--brand-gold)', letterSpacing: '0.2em', fontFamily: 'var(--font-mono)' }}>
              CONFORMIDADE CNPq 2664/2026 · UFPB 57/2025
            </span>
          </div>

          <h1 className="rise rise-2" style={{
            fontSize: 'clamp(38px, 6vw, 74px)', fontWeight: 700,
            lineHeight: 1.04, letterSpacing: '-0.035em', marginBottom: 26,
            color: 'var(--text-primary)',
          }}>
            A auditoria forense de IA<br />
            <span className="text-gold-gradient">que universidades conseguem defender.</span>
          </h1>

          <p className="rise rise-3" style={{
            fontSize: 'clamp(16px, 1.7vw, 20px)', color: 'var(--text-secondary)', maxWidth: 640,
            margin: '0 auto 40px', lineHeight: 1.65,
          }}>
            Detecte texto sintético, valide citações, aplique normativas reais
            e emita um Certificado de Integridade Digital verificável.
          </p>

          <div className="rise rise-4" style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/signup">
              <button style={{
                background: 'linear-gradient(180deg, var(--gold-hover), var(--brand-gold))', color: 'var(--ink-950)',
                fontWeight: 700, fontSize: 15, padding: '14px 30px',
                borderRadius: 12, border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 8,
                boxShadow: '0 16px 40px -16px rgba(199,162,74,0.6)',
              }}>
                Analisar gratuitamente <ArrowRight size={16} />
              </button>
            </Link>
            <a href="mailto:comercial@alshamglobal.com.br">
              <button style={{
                background: 'color-mix(in srgb, var(--surface-700) 55%, transparent)', color: 'var(--brand-gold)',
                fontWeight: 600, fontSize: 15, padding: '14px 30px',
                borderRadius: 12, border: '1px solid color-mix(in srgb, var(--brand-gold) 40%, transparent)',
                backdropFilter: 'blur(8px)', cursor: 'pointer',
              }}>
                Solicitar plano institucional
              </button>
            </a>
          </div>

          <p className="rise rise-5" style={{ marginTop: 18, fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.04em' }}>
            Sem cartão · 3 análises gratuitas · Resultado em &lt;30 segundos
          </p>

          {/* forensic proof chips — grounded, no fabricated metrics */}
          <div className="rise rise-5" style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginTop: 42 }}>
            {[
              { Icon: HashVerification,   label: 'SHA-256 público' },
              { Icon: CidSeal,            label: 'Certificado CID' },
              { Icon: BibliographicCheck, label: 'Citações verificadas' },
              { Icon: RiskEscalation,     label: 'Dosimetria de sanção' },
            ].map(({ Icon, label }) => (
              <div key={label} style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: 'color-mix(in srgb, var(--surface-800) 65%, transparent)',
                border: '1px solid var(--border-soft)', backdropFilter: 'blur(6px)',
                borderRadius: 999, padding: '8px 15px',
              }}>
                <Icon size={15} style={{ color: 'var(--brand-gold)', flexShrink: 0 }} />
                <span style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────── TRUST RAIL ─────────── */}
      <section style={{ borderTop: '1px solid var(--border-soft)', borderBottom: '1px solid var(--border-soft)', padding: '28px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: 24, justifyContent: 'center' }}>
          {TRUST_ITEMS.map(({ Icon, label }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Icon size={18} style={{ color: 'var(--brand-gold)', flexShrink: 0 }} />
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ─────────── DEMO INTERATIVO ─────────── */}
      <section style={{ maxWidth: 820, margin: '80px auto', padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h2 style={{ fontSize: 32, fontWeight: 600, letterSpacing: '-0.02em', marginBottom: 12 }}>
            Mais do que detectar IA: <span style={{ color: 'var(--brand-gold)' }}>produzir evidência</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 16 }}>Cole um trecho agora. Sem cadastro.</p>
        </div>
        <div className="panel" style={{ padding: 28 }}>
          <div style={{ fontSize: 10, letterSpacing: '0.15em', color: 'var(--brand-gold)', fontFamily: 'var(--font-mono)', marginBottom: 14 }}>DEMO INTERATIVO</div>
          <textarea
            placeholder="Cole um trecho de texto acadêmico aqui (mínimo 80 caracteres)..."
            style={{
              width: '100%', minHeight: 120, background: 'var(--ink-950)',
              color: 'var(--text-primary)', border: '1px solid var(--border-strong)',
              borderRadius: 12, padding: 14, fontSize: 14, boxSizing: 'border-box',
              resize: 'vertical', outline: 'none', fontFamily: 'var(--font-inter)',
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
            <Link href="/signup">
              <button style={{
                background: 'var(--brand-gold)', color: 'var(--ink-950)',
                fontWeight: 700, padding: '10px 22px', borderRadius: 10,
                border: 'none', cursor: 'pointer', fontSize: 14,
              }}>Analisar texto →</button>
            </Link>
          </div>
        </div>
      </section>

      {/* ─────────── COMO FUNCIONA ─────────── */}
      <section style={{ maxWidth: 1120, margin: '0 auto 96px', padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 52 }}>
          <div style={{ fontSize: 10.5, letterSpacing: '0.22em', color: 'var(--brand-gold)', fontFamily: 'var(--font-mono)', marginBottom: 14 }}>FLUXO FORENSE</div>
          <h2 style={{ fontSize: 'clamp(26px, 3.4vw, 36px)', fontWeight: 600, letterSpacing: '-0.025em' }}>
            Do score ao <span className="text-gold-gradient">certificado verificável</span>
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(196px, 1fr))', gap: 18 }}>
          {HOW_STEPS.map((s, i) => {
            const Icon = HOW_ICONS[i]
            return (
              <div key={s.n} className="frame-card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span className="frame-icon"><Icon size={20} /></span>
                  <span className="mono" style={{ fontSize: 12, color: 'color-mix(in srgb, var(--brand-gold) 65%, transparent)', letterSpacing: '0.14em' }}>{s.n}</span>
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 8, color: 'var(--text-primary)' }}>{s.title}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{s.desc}</div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ─────────── COMPARATIVO ─────────── */}
      <section style={{ maxWidth: 920, margin: '0 auto 96px', padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 44 }}>
          <div style={{ fontSize: 10.5, letterSpacing: '0.22em', color: 'var(--brand-gold)', fontFamily: 'var(--font-mono)', marginBottom: 14 }}>COMPARATIVO</div>
          <h2 style={{ fontSize: 'clamp(26px, 3.4vw, 36px)', fontWeight: 600, letterSpacing: '-0.025em' }}>
            Conformidade acadêmica com <span className="text-gold-gradient">rastreabilidade pública</span>
          </h2>
        </div>
        <div className="panel" style={{ overflow: 'hidden', padding: 0 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-strong)' }}>
                {['Funcionalidade', 'ALSHAM', 'GPTZero', 'Turnitin', 'Originality'].map((h, i) => (
                  <th key={h} style={{
                    padding: '16px 20px', textAlign: i === 0 ? 'left' : 'center',
                    fontSize: i === 1 ? 12.5 : 12, color: i === 1 ? 'var(--brand-gold)' : 'var(--text-muted)',
                    fontWeight: i === 1 ? 800 : 500, letterSpacing: i === 1 ? '0.04em' : '0.02em',
                    background: i === 1 ? 'color-mix(in srgb, var(--brand-gold) 9%, transparent)' : 'transparent',
                    borderTopLeftRadius: 0,
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARISON.map((row, i) => (
                <tr key={row.feat} style={{ borderBottom: i < COMPARISON.length - 1 ? '1px solid var(--border-soft)' : 'none' }}>
                  <td style={{ padding: '14px 20px', fontSize: 13, color: 'var(--text-secondary)' }}>{row.feat}</td>
                  {[row.al, row.gz, row.tt, row.or].map((v, j) => (
                    <td key={j} style={{
                      textAlign: 'center', padding: '14px 12px',
                      background: j === 0 ? 'color-mix(in srgb, var(--brand-gold) 7%, transparent)' : 'transparent',
                    }}>
                      {v
                        ? <CheckCircle size={16} style={{ color: j === 0 ? 'var(--status-success)' : 'var(--text-muted)', margin: '0 auto' }} />
                        : <span style={{ color: 'var(--border-strong)', fontSize: 16 }}>–</span>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ─────────── BLOCO INSTITUCIONAL ─────────── */}
      <section style={{ background: 'var(--surface-800)', borderTop: '1px solid var(--border-soft)', borderBottom: '1px solid var(--border-soft)', padding: '60px 24px', marginBottom: 80 }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 10, letterSpacing: '0.15em', color: 'var(--brand-gold)', fontFamily: 'var(--font-mono)', marginBottom: 16 }}>PARA COORDENAÇÕES E ORIENTADORES</div>
            <h2 style={{ fontSize: 28, fontWeight: 600, letterSpacing: '-0.02em', marginBottom: 16 }}>
              A plataforma forense para programas de pós-graduação
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.7, marginBottom: 24 }}>
              Plano Institucional com análises ilimitadas, normativas personalizadas
              e acesso API para integração direta com sistemas acadêmicos.
            </p>
            <a href="mailto:comercial@alshamglobal.com.br">
              <button style={{
                background: 'var(--brand-gold)', color: 'var(--ink-950)',
                fontWeight: 700, padding: '12px 24px', borderRadius: 10,
                border: 'none', cursor: 'pointer', fontSize: 14,
              }}>Solicitar demonstração institucional</button>
            </a>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {['Conformidade citada por artigo de normativa', 'CID emitido por análise — provável em processo', 'Histórico de reenvios por usuário', 'API REST para integração institucional', 'Suporte prioritário e SLA'].map(f => (
              <div key={f} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <CheckCircle size={16} style={{ color: 'var(--status-success)', marginTop: 2, flexShrink: 0 }} />
                <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────── PRICING ─────────── */}
      <section style={{ maxWidth: 1100, margin: '0 auto 80px', padding: '0 24px' }}>
        <h2 style={{ fontSize: 32, fontWeight: 600, textAlign: 'center', marginBottom: 12, letterSpacing: '-0.02em' }}>Valide autoria, citações e risco institucional</h2>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: 48 }}>em um só fluxo</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
          {[
            { id: 'free',         name: 'Gratuito',      price: 'R$0',      period: '',      analyses: 3,    chars: '2.000',  highlight: false },
            { id: 'estudantil',   name: 'Estudantil',    price: 'R$29,90',  period: '/mês',  analyses: 30,   chars: '8.000',  highlight: false },
            { id: 'profissional', name: 'Profissional',  price: 'R$89,90',  period: '/mês',  analyses: 150,  chars: '20.000', highlight: true  },
            { id: 'institucional',name: 'Institucional', price: 'R$497',    period: '/mês',  analyses: -1,   chars: '50.000', highlight: false },
          ].map(p => (
            <div key={p.id} style={{
              background: p.highlight ? 'var(--surface-600)' : 'var(--surface-800)',
              border: p.highlight ? '2px solid var(--brand-gold)' : '1px solid var(--border-soft)',
              borderRadius: 20, padding: 28, position: 'relative',
            }}>
              {p.highlight && (
                <div style={{
                  position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
                  background: 'var(--brand-gold)', color: 'var(--ink-950)',
                  fontSize: 10, fontWeight: 800, letterSpacing: '0.12em', padding: '4px 16px',
                  borderRadius: 999, fontFamily: 'var(--font-mono)',
                }}>MAIS POPULAR</div>
              )}
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--brand-gold)', marginBottom: 8 }}>{p.name}</div>
              <div style={{ fontSize: 30, fontWeight: 700, color: 'var(--text-primary)' }}>
                {p.price}<span style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 400 }}>{p.period}</span>
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', margin: '12px 0 20px' }}>
                {p.analyses === -1 ? 'Análises ilimitadas' : `${p.analyses} análises/mês`} · até {p.chars} chars
              </div>
              <Link href={p.id === 'free' ? '/signup' : `/signup?plan=${p.id}`}>
                <button style={{
                  width: '100%', background: p.highlight ? 'var(--brand-gold)' : 'transparent',
                  color: p.highlight ? 'var(--ink-950)' : 'var(--brand-gold)',
                  border: p.highlight ? 'none' : '1px solid color-mix(in srgb, var(--brand-gold) 50%, transparent)',
                  borderRadius: 10, padding: '10px 0', fontWeight: 600, cursor: 'pointer', fontSize: 14,
                }}>Começar</button>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ─────────── FAQ ─────────── */}
      <section style={{ maxWidth: 720, margin: '0 auto 80px', padding: '0 24px' }}>
        <h2 style={{ fontSize: 28, fontWeight: 600, textAlign: 'center', marginBottom: 40, letterSpacing: '-0.02em' }}>Perguntas frequentes</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {FAQ.map(item => (
            <div key={item.q} className="panel-inner" style={{ padding: '18px 22px' }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>{item.q}</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.65 }}>{item.a}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─────────── CTA FINAL ─────────── */}
      <section style={{ background: 'var(--surface-800)', borderTop: '1px solid var(--border-soft)', padding: '70px 24px', textAlign: 'center' }}>
        <h2 style={{ fontSize: 36, fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 16 }}>
          Analisar <span style={{ color: 'var(--brand-gold)' }}>gratuitamente</span>
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 16 }}>
          3 análises gratuitas. Sem cartão de crédito. Resultado em menos de 30 segundos.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/signup">
            <button style={{
              background: 'var(--brand-gold)', color: 'var(--ink-950)',
              fontWeight: 700, fontSize: 16, padding: '14px 36px',
              borderRadius: 10, border: 'none', cursor: 'pointer',
            }}>Analisar gratuitamente</button>
          </Link>
          <a href="mailto:comercial@alshamglobal.com.br">
            <button style={{
              background: 'transparent', color: 'var(--text-secondary)',
              fontWeight: 500, fontSize: 15, padding: '14px 28px',
              borderRadius: 10, border: '1px solid var(--border-strong)', cursor: 'pointer',
            }}>Solicitar demonstração institucional</button>
          </a>
        </div>
      </section>
    </div>
  )
}
