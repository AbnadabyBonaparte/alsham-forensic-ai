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
      background: 'linear-gradient(135deg, #1B2A4A 0%, #0A0F1E 100%)',
      borderRadius: 16, padding: 24,
      border: '1px solid #C9A84C44',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <Shield size={20} color="#C9A84C" />
        <div style={{ fontSize: 10, letterSpacing: 3, color: '#C9A84C', fontWeight: 700 }}>CERTIFICADO DE INTEGRIDADE DIGITAL</div>
      </div>

      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <div style={{ fontSize: 10, letterSpacing: 3, color: '#94A3B8', marginBottom: 8 }}>CÓDIGO CID</div>
        <div style={{ fontSize: 22, fontWeight: 800, color: '#C9A84C', letterSpacing: 2, fontFamily: 'monospace' }}>{cidCode}</div>
      </div>

      <div style={{ background: '#0A0F1E', borderRadius: 8, padding: 12, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
          <Hash size={12} color="#C9A84C" />
          <span style={{ fontSize: 10, letterSpacing: 2, color: '#C9A84C' }}>SHA-256</span>
        </div>
        <div style={{ fontSize: 10, color: '#64748B', fontFamily: 'monospace', wordBreak: 'break-all', lineHeight: 1.6 }}>
          {textHash}
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 10, color: '#64748B', marginBottom: 4 }}>Link de verificação pública:</div>
        <a
          href={verifyUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{ fontSize: 12, color: '#C9A84C', textDecoration: 'none', wordBreak: 'break-all' }}
        >
          {verifyUrl}
        </a>
      </div>

      {hasPdfAccess ? (
        <Button
          onClick={downloadPDF}
          disabled={downloading || !analysisId}
          style={{ width: '100%', background: '#C9A84C', color: '#0A0F1E', fontWeight: 700 }}
        >
          <Download size={14} style={{ marginRight: 6 }} />
          {downloading ? 'Gerando PDF...' : 'Baixar Certificado PDF'}
        </Button>
      ) : (
        <div style={{ textAlign: 'center', fontSize: 12, color: '#64748B' }}>
          <a href="/pricing" style={{ color: '#C9A84C' }}>Plano Profissional</a> inclui download do PDF
        </div>
      )}
    </div>
  )
}
