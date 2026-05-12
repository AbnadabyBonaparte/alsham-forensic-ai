'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function SettingsPage() {
  const [profile, setProfile] = useState<{ full_name?: string; email?: string; plans?: Record<string, unknown> } | null>(null)
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      supabase.from('profiles').select('*, plans(*)').eq('id', user.id).single().then(({ data }) => {
        setProfile(data)
        setName(data?.full_name ?? '')
      })
    })
  }, [])

  async function saveProfile() {
    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('profiles').update({ full_name: name, updated_at: new Date().toISOString() }).eq('id', user.id)
    setMsg('Perfil atualizado com sucesso.')
    setSaving(false)
  }

  async function manageSubscription() {
    const res = await fetch('/api/stripe/portal', { method: 'POST' })
    const { url } = await res.json() as { url?: string }
    if (url) window.location.href = url
  }

  return (
    <div style={{ maxWidth: 600 }}>
      <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 32 }}>Configurações</h1>

      <div style={{ background: '#1B2A4A', borderRadius: 16, padding: 28, marginBottom: 24, border: '1px solid #2D3A56' }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Perfil</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <Label style={{ color: '#94A3B8', fontSize: 13 }}>Nome</Label>
            <Input
              value={name}
              onChange={e => setName(e.target.value)}
              style={{ background: '#0A0F1E', border: '1px solid #2D3A56', color: '#F8FAFC', marginTop: 6 }}
            />
          </div>
          <div>
            <Label style={{ color: '#94A3B8', fontSize: 13 }}>E-mail</Label>
            <Input
              value={profile?.email ?? ''}
              disabled
              style={{ background: '#0A0F1E', border: '1px solid #2D3A56', color: '#64748B', marginTop: 6 }}
            />
          </div>
          {msg && <p style={{ fontSize: 13, color: '#16A34A' }}>{msg}</p>}
          <Button
            onClick={saveProfile}
            disabled={saving}
            style={{ background: '#C9A84C', color: '#0A0F1E', fontWeight: 700, alignSelf: 'flex-start' }}
          >
            {saving ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </div>

      <div style={{ background: '#1B2A4A', borderRadius: 16, padding: 28, border: '1px solid #2D3A56' }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Assinatura</h2>
        <p style={{ color: '#94A3B8', fontSize: 14, marginBottom: 20 }}>
          Plano atual: <strong style={{ color: '#C9A84C' }}>{(profile?.plans as Record<string, unknown>)?.name_pt as string ?? 'Gratuito'}</strong>
        </p>
        <div style={{ display: 'flex', gap: 12 }}>
          <Button
            onClick={manageSubscription}
            variant="outline"
            style={{ borderColor: '#C9A84C', color: '#C9A84C' }}
          >
            Gerenciar Assinatura
          </Button>
        </div>
      </div>
    </div>
  )
}
