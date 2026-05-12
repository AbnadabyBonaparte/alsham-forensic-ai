'use client'
import { useState } from 'react'
import { Shield, Hash } from 'lucide-react'
import { verdictColor } from '@/lib/utils'

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
  forensic_summary?: string
}

export function VerifyResult({ data, cid }: { data: Record<string, string | number>; cid: string }) {
  const d = data as unknown as VerifyData
  const [inputText, setInputText] = useState('')
  const [hashStatus, setHashStatus] = useState<'idle' | 'match' | 'mismatch'>('idle')
  const color = verdictColor(d.verdict)

  async function verifyHash() {
    if (!inputText.trim()) return
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(inputText))
    const hash = Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
    setHashStatus(hash === d.text_hash ? 'match' : 'mismatch')
  }

  return (
    <div style={{ maxWidth: 600, width: '100%', fontFamily: 'system-ui, sans-serif' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 12 }}>
          <Shield size={20} color="#C9A84C" />
          <span style={{ fontSize: 10, letterSpacing: 4, color: '#C9A84C' }}>ALSHAM GLOBAL COMMERCE · CID</span>
        </div>
        <div style={{ fontSize: 22, fontWeight: 700, color: '#F8FAFC', letterSpacing: 1, fontFamily: 'monospace' }}>{cid}</div>
        <div style={{ fontSize: 12, color: '#64748B', marginTop: 6 }}>
          Emitido em {new Date(d.created_at).toLocaleString('pt-BR')}
        </div>
      </div>

      {/* Score block */}
      <div style={{ background: '#1B2A4A', borderRadius: 12, padding: 24, marginBottom: 12, textAlign: 'center' }}>
        <div style={{ fontSize: 56, fontWeight: 800, color, lineHeight: 1 }}>{d.overall_ai_score}</div>
        <div style={{ fontSize: 11, letterSpacing: 3, color, marginTop: 6 }}>{d.verdict}</div>
        <div style={{ fontSize: 13, color: '#94A3B8', marginTop: 8 }}>Modelo detectado: {d.detected_model}</div>
      </div>

      {/* Details */}
      <div style={{ background: '#1B2A4A', borderRadius: 12, padding: 16, marginBottom: 12 }}>
        <table style={{ width: '100%', fontSize: 13, color: '#F8FAFC', borderCollapse: 'collapse' }}>
          <tbody>
            {([
              ['Instituição', d.institution_name],
              ['Conformidade', d.compliance_verdict],
              ['Risco', d.compliance_risk],
              ['Motor', d.analysis_engine],
              ['Hash SHA-256', d.text_hash ? d.text_hash.slice(0, 20) + '...' : 'N/A'],
            ] as [string, string | number][]).map(([k, v]) => (
              <tr key={k}>
                <td style={{ color: '#64748B', padding: '7px 0', width: '40%' }}>{k}</td>
                <td style={{ textAlign: 'right', padding: '7px 0' }}>{v}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Hash verification */}
      <div style={{ background: '#1B2A4A', borderRadius: 12, padding: 18, marginBottom: 12 }}>
        <div style={{ fontSize: 10, letterSpacing: 2, color: '#C9A84C', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Hash size={12} />
          VERIFICAR DOCUMENTO ORIGINAL
        </div>
        <p style={{ fontSize: 12, color: '#94A3B8', margin: '0 0 12px', lineHeight: 1.5 }}>
          Cole o texto exato do documento para confirmar que este certificado corresponde a ele.
        </p>
        <textarea
          value={inputText}
          onChange={e => { setInputText(e.target.value); setHashStatus('idle') }}
          placeholder="Cole o texto do documento aqui..."
          style={{
            width: '100%', minHeight: 80, background: '#0A0F1E', color: '#F8FAFC',
            border: '1px solid #2D3A56', borderRadius: 8, padding: 10,
            fontSize: 12, boxSizing: 'border-box', resize: 'vertical',
            fontFamily: 'inherit', outline: 'none',
          }}
        />
        <button
          onClick={verifyHash}
          disabled={!inputText.trim()}
          style={{
            marginTop: 10, background: inputText.trim() ? '#C9A84C' : '#2D3A56',
            color: inputText.trim() ? '#0A0F1E' : '#64748B',
            border: 'none', padding: '9px 22px', borderRadius: 6,
            fontWeight: 700, cursor: inputText.trim() ? 'pointer' : 'not-allowed', fontSize: 13,
          }}
        >
          Verificar Hash SHA-256
        </button>

        {hashStatus === 'match' && (
          <div style={{ marginTop: 12, padding: '12px 16px', background: '#14532D', borderRadius: 8, color: '#86EFAC', fontSize: 13, fontWeight: 600 }}>
            ✓ DOCUMENTO AUTÊNTICO — Hash SHA-256 confere com o certificado original.
          </div>
        )}
        {hashStatus === 'mismatch' && (
          <div style={{ marginTop: 12, padding: '12px 16px', background: '#7F1D1D', borderRadius: 8, color: '#FCA5A5', fontSize: 13, fontWeight: 600 }}>
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
