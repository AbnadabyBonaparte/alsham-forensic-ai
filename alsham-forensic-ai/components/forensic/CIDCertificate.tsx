'use client'
import { useState } from 'react'
import { Shield, Download, Hash } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CIDCertificateProps {
  cidCode: string
  textHash: string
  analysisId?: string
  hasPdfAccess: boolean
}

export function CIDCertificate({ cidCode, textHash, analysisId, hasPdfAccess }: CIDCertificateProps) {
  const [downloading, setDownloading] = useState(false)

  async function downloadPDF() {
    if (!analysisId) return
    setDownloading(true)
    try {
      const res = await fetch('/api/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analysisId }),
      })
      if (!res.ok) {
        const err = await res.json() as { message?: string }
        alert(err.message ?? 'Erro ao gerar PDF')
        return
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `CID-${cidCode}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setDownloading(false)
    }
  }

  const verifyUrl = `${window.location.origin}/verify/${cidCode}`

  return (
    <div style={{
      background: 'linear-gradient(135deg, var(--surface-600) 0%, var(--ink-950) 100%)',
      borderRadius: 16, padding: 24,
      border: '1px solid rgba(199,162,74,0.27)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <Shield size={20} color="var(--brand-gold)" />
        <div style={{ fontSize: 10, letterSpacing: 3, color: 'var(--brand-gold)', fontWeight: 700 }}>CERTIFICADO DE INTEGRIDADE DIGITAL</div>
      </div>

      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <div style={{ fontSize: 10, letterSpacing: 3, color: 'var(--text-secondary)', marginBottom: 8 }}>CÓDIGO CID</div>
        <div className="cid" style={{ fontSize: 22, fontWeight: 800, color: 'var(--brand-gold)', letterSpacing: 2 }}>{cidCode}</div>
      </div>

      <div style={{ background: 'var(--ink-950)', borderRadius: 8, padding: 12, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
          <Hash size={12} color="var(--brand-gold)" />
          <span style={{ fontSize: 10, letterSpacing: 2, color: 'var(--brand-gold)' }}>SHA-256</span>
        </div>
        <div className="hash" style={{ fontSize: 10, color: 'var(--text-muted)', wordBreak: 'break-all', lineHeight: 1.6 }}>
          {textHash}
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>Link de verificação pública:</div>
        <a
          href={verifyUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{ fontSize: 12, color: 'var(--brand-gold)', textDecoration: 'none', wordBreak: 'break-all' }}
        >
          {verifyUrl}
        </a>
      </div>

      {hasPdfAccess ? (
        <Button
          onClick={downloadPDF}
          disabled={downloading || !analysisId}
          style={{ width: '100%', background: 'var(--brand-gold)', color: 'var(--ink-950)', fontWeight: 700 }}
        >
          <Download size={14} style={{ marginRight: 6 }} />
          {downloading ? 'Gerando PDF...' : 'Baixar Certificado PDF'}
        </Button>
      ) : (
        <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)' }}>
          <a href="/pricing" style={{ color: 'var(--brand-gold)' }}>Plano Profissional</a> inclui download do PDF
        </div>
      )}
    </div>
  )
}
