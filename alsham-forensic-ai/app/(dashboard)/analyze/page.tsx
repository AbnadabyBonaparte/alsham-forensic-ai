'use client'
import { Suspense } from 'react'
import { AnalyzeForm } from '@/components/forensic/AnalyzeForm'

export default function AnalyzePage() {
  return (
    <div>
      <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 8 }}>Nova Análise Forense</h1>
      <p style={{ color: '#94A3B8', marginBottom: 32 }}>
        Cole o texto acadêmico para análise forense completa com laudo jurídico e Certificado CID.
      </p>
      <Suspense fallback={<div style={{ color: '#94A3B8' }}>Carregando...</div>}>
        <AnalyzeForm />
      </Suspense>
    </div>
  )
}
