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
      <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 32, color: 'var(--text-primary)' }}>Configurações</h1>

      <div style={{ background: 'var(--surface-600)', borderRadius: 16, padding: 28, marginBottom: 24, border: '1px solid var(--border-strong)' }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20, color: 'var(--text-primary)' }}>Perfil</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <Label style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Nome</Label>
            <Input
              value={name}
              onChange={e => setName(e.target.value)}
              style={{ background: 'var(--ink-950)', border: '1px solid var(--border-strong)', color: 'var(--text-primary)', marginTop: 6 }}
            />
          </div>
          <div>
            <Label style={{ color: 'var(--text-secondary)', fontSize: 13 }}>E-mail</Label>
            <Input
              value={profile?.email ?? ''}
              disabled
              style={{ background: 'var(--ink-950)', border: '1px solid var(--border-strong)', color: 'var(--text-muted)', marginTop: 6 }}
            />
          </div>
          {msg && <p style={{ fontSize: 13, color: 'var(--status-success)' }}>{msg}</p>}
          <Button
            onClick={saveProfile}
            disabled={saving}
            style={{ background: 'var(--brand-gold)', color: 'var(--ink-950)', fontWeight: 700, alignSelf: 'flex-start' }}
          >
            {saving ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </div>

      <div style={{ background: 'var(--surface-600)', borderRadius: 16, padding: 28, border: '1px solid var(--border-strong)' }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)' }}>Assinatura</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 20 }}>
          Plano atual: <strong style={{ color: 'var(--brand-gold)' }}>{(profile?.plans as Record<string, unknown>)?.name_pt as string ?? 'Gratuito'}</strong>
        </p>
        <div style={{ display: 'flex', gap: 12 }}>
          <Button
            onClick={manageSubscription}
            variant="outline"
            style={{ borderColor: 'var(--brand-gold)', color: 'var(--brand-gold)' }}
          >
            Gerenciar Assinatura
          </Button>
        </div>
      </div>
    </div>
  )
}
