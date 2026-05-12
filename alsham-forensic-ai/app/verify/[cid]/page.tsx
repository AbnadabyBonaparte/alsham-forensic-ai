import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { VerifyResult } from '@/components/forensic/VerifyResult'
import { Shield } from 'lucide-react'

export async function generateMetadata({ params }: { params: Promise<{ cid: string }> }) {
  const { cid } = await params
  return {
    title: `Verificação CID ${cid} — ALSHAM Forensic AI`,
    description: 'Verifique a autenticidade deste Certificado de Integridade Digital.',
    robots: 'noindex',
  }
}

export default async function VerifyPage({ params }: { params: Promise<{ cid: string }> }) {
  const { cid } = await params
  const supabase = await createClient()
  const { data } = await supabase.rpc('get_public_analysis_by_cid', { p_cid: cid })
  if (!data) notFound()

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-app)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '48px 24px',
    }}>
      {/* Subtle glow */}
      <div className="glow-gold" style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }} />

      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 580 }}>
        <VerifyResult data={data as Record<string, string | number>} cid={cid} />
      </div>
    </div>
  )
}
