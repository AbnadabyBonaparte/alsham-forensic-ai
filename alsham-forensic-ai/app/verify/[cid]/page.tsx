import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { VerifyResult } from '@/components/forensic/VerifyResult'

export async function generateMetadata({ params }: { params: Promise<{ cid: string }> }) {
  const { cid } = await params
  return {
    title: `Verificação CID ${cid} — ALSHAM Forensic AI`,
    description: 'Verifique a autenticidade deste Certificado de Integridade Digital',
    robots: 'noindex',
  }
}

export default async function VerifyPage({ params }: { params: Promise<{ cid: string }> }) {
  const { cid } = await params
  const supabase = await createClient()
  const { data } = await supabase.rpc('get_public_analysis_by_cid', { p_cid: cid })
  if (!data) notFound()

  return (
    <main style={{
      minHeight: '100vh',
      background: '#0A0F1E',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
    }}>
      <VerifyResult data={data as Record<string, string | number>} cid={cid} />
    </main>
  )
}
