'use client'
import { useState } from 'react'
import { Shield, Copy, ExternalLink, CheckCircle, XCircle } from 'lucide-react'
import { verdictColor, verdictLabel, formatDate } from '@/lib/utils'
import { CidSeal, HashVerification, NormativeShield } from '@/components/icons'
import { Disclaimer } from './Disclaimer'

interface VerifyData {
  cid_code: string
  overall_ai_score: number
  verdict: string
  detected_model: string
  compliance_verdict: string
  compliance_risk: string
  institution_name: string
  text_hash: string
  text_preview: string
  created_at: string
  analysis_engine: string
}

export function VerifyResult({ data, cid }: { data: Record<string, string | number>; cid: string }) {
  const d = data as unknown as VerifyData
  const [inputText, setInputText] = useState('')
  const [hashStatus, setHashStatus] = useState<'idle' | 'match' | 'mismatch'>('idle')
  const [copied, setCopied] = useState(false)

  const color = verdictColor(d.verdict)

  async function verifyHash() {
    if (!inputText.trim()) return
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(inputText))
    const hash = Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
    setHashStatus(hash === d.text_hash ? 'match' : 'mismatch')
  }

  async function copyLink() {
    await navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={{
      width: '100%', maxWidth: 580,
      fontFamily: 'var(--font-inter, system-ui)',
    }}>
      {/* ─── SEAL HEADER ─── */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <div style={{
            width: 48, height: 48, borderRadius: '50%',
            border: '1.5px solid color-mix(in srgb, var(--brand-gold) 50%, transparent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Shield size={22} style={{ color: 'var(--brand-gold)' }} />
          </div>
        </div>
        <div style={{ fontSize: 10, letterSpacing: '0.2em', color: 'var(--brand-gold)', fontFamily: 'var(--font-mono)', marginBottom: 6 }}>
          ALSHAM GLOBAL COMMERCE · CERTIFICADO DE INTEGRIDADE DIGITAL
        </div>
        <div className="cid" style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '0.08em' }}>
          {cid}
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
          Emitido em {formatDate(d.created_at)}
        </div>
      </div>

      {/* ─── SCORE BLOCK ─── */}
      <div style={{
        background: 'var(--surface-800)',
        border: '1px solid color-mix(in srgb, var(--brand-gold) 25%, transparent)',
        borderRadius: 16, padding: '28px 24px', marginBottom: 12, textAlign: 'center',
      }}>
        <div className="score-value" style={{ fontSize: 64, fontWeight: 700, color, lineHeight: 1 }}>
          {d.overall_ai_score}
        </div>
        <div style={{ fontSize: 11, letterSpacing: '0.18em', color, marginTop: 8, fontFamily: 'var(--font-mono)' }}>
          {d.verdict}
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 10 }}>
          {verdictLabel(d.verdict)} · Modelo detectado: <strong style={{ color: 'var(--text-primary)' }}>{d.detected_model}</strong>
        </div>
      </div>

      {/* ─── DETAILS TABLE ─── */}
      <div style={{
        background: 'var(--surface-800)', borderRadius: 16,
        border: '1px solid var(--border-soft)', padding: '16px 20px', marginBottom: 12,
      }}>
        <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
          <tbody>
            {([
              ['Instituição', d.institution_name],
              ['Conformidade', d.compliance_verdict],
              ['Nível de risco', d.compliance_risk],
              ['Motor de análise', d.analysis_engine],
            ] as [string, string][]).map(([k, v]) => (
              <tr key={k}>
                <td style={{ color: 'var(--text-muted)', padding: '7px 0', width: '45%' }}>{k}</td>
                <td style={{ textAlign: 'right', padding: '7px 0', color: 'var(--text-primary)' }}>{v}</td>
              </tr>
            ))}
            <tr>
              <td style={{ color: 'var(--text-muted)', padding: '7px 0' }}>SHA-256</td>
              <td className="hash" style={{ textAlign: 'right', fontSize: 10, color: 'var(--text-muted)', padding: '7px 0', wordBreak: 'break-all' }}>
                {d.text_hash?.slice(0, 24)}…
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ─── HASH VERIFICATION ─── */}
      <div style={{
        background: 'var(--surface-800)', borderRadius: 16,
        border: '1px solid var(--border-soft)', padding: '20px', marginBottom: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <HashVerification size={15} style={{ color: 'var(--brand-gold)' }} />
          <span style={{ fontSize: 10, letterSpacing: '0.15em', color: 'var(--brand-gold)', fontFamily: 'var(--font-mono)' }}>
            VERIFICAR DOCUMENTO ORIGINAL
          </span>
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '0 0 12px', lineHeight: 1.6 }}>
          Cole o texto exato do documento para confirmar que este certificado corresponde a ele.
        </p>
        <textarea
          value={inputText}
          onChange={e => { setInputText(e.target.value); setHashStatus('idle') }}
          placeholder="Cole o texto do documento aqui…"
          style={{
            width: '100%', minHeight: 80, background: 'var(--ink-950)',
            color: 'var(--text-primary)', border: '1px solid var(--border-strong)',
            borderRadius: 10, padding: 10, fontSize: 12,
            boxSizing: 'border-box', resize: 'vertical',
            fontFamily: 'var(--font-inter)', outline: 'none',
          }}
        />
        <button
          onClick={verifyHash}
          disabled={!inputText.trim()}
          style={{
            marginTop: 10,
            background: inputText.trim() ? 'var(--brand-gold)' : 'var(--surface-700)',
            color: inputText.trim() ? 'var(--ink-950)' : 'var(--text-muted)',
            border: 'none', padding: '9px 24px', borderRadius: 8,
            fontWeight: 700, fontSize: 13,
            cursor: inputText.trim() ? 'pointer' : 'not-allowed',
          }}
        >
          Verificar Hash SHA-256
        </button>

        {hashStatus === 'match' && (
          <div className="bg-success-sf" style={{ marginTop: 12, padding: '12px 16px', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
            <CheckCircle size={16} style={{ color: 'var(--status-success)', flexShrink: 0 }} />
            <span className="cert-verified" style={{ fontSize: 13, fontWeight: 600 }}>
              DOCUMENTO AUTÊNTICO — Hash SHA-256 confere com o certificado original.
            </span>
          </div>
        )}
        {hashStatus === 'mismatch' && (
          <div className="bg-danger-sf" style={{ marginTop: 12, padding: '12px 16px', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
            <XCircle size={16} style={{ color: 'var(--status-danger)', flexShrink: 0 }} />
            <span className="cert-fraud" style={{ fontSize: 13, fontWeight: 600 }}>
              ALERTA DE FRAUDE — O texto não corresponde ao documento analisado neste certificado.
            </span>
          </div>
        )}
      </div>

      {/* ─── SHARE ─── */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        <button
          onClick={copyLink}
          style={{
            flex: 1, background: 'var(--surface-700)', color: copied ? 'var(--status-success)' : 'var(--text-secondary)',
            border: '1px solid var(--border-soft)', borderRadius: 10,
            padding: '10px 0', fontSize: 13, fontWeight: 500, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}
        >
          <Copy size={14} />{copied ? 'Link copiado!' : 'Copiar link'}
        </button>
        <a
          href={`/verify/${cid}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            flex: 1, background: 'var(--surface-700)', color: 'var(--text-secondary)',
            border: '1px solid var(--border-soft)', borderRadius: 10,
            padding: '10px 0', fontSize: 13, fontWeight: 500, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            textDecoration: 'none',
          }}
        >
          <ExternalLink size={14} /> Abrir página
        </a>
      </div>

      {/* ─── DISCLAIMER ─── */}
      <div style={{ marginBottom: 24 }}>
        <Disclaimer />
      </div>

      {/* ─── FOOTER ─── */}
      <div style={{ textAlign: 'center', fontSize: 10, color: 'var(--border-strong)', fontFamily: 'var(--font-mono)' }}>
        ALSHAM FORENSIC AI™ · forensic.alshamglobal.com.br · ALSHAM Global Commerce Ltda
      </div>
    </div>
  )
}
