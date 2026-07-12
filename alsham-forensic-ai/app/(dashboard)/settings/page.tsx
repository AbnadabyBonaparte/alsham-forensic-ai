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
    <div style={{ padding: '40px clamp(24px, 4vw, 48px)', maxWidth: 640, margin: '0 auto' }}>
      <div className="eyebrow" style={{ marginBottom: 12 }}>CONTA</div>
      <h1 className="page-title" style={{ marginBottom: 30 }}>Configurações</h1>

      <div className="panel" style={{ padding: 28, marginBottom: 22 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20, color: 'var(--text-primary)' }}>Perfil</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <Label className="field-label">Nome</Label>
            <Input
              value={name}
              onChange={e => setName(e.target.value)}
              className="field-input"
            />
          </div>
          <div>
            <Label className="field-label">E-mail</Label>
            <Input
              value={profile?.email ?? ''}
              disabled
              className="field-input"
              style={{ color: 'var(--text-muted)', opacity: 0.8 }}
            />
          </div>
          {msg && (
            <div className="bg-success-sf" style={{ padding: '10px 14px', fontSize: 13, color: 'var(--status-success)' }}>{msg}</div>
          )}
          <Button
            onClick={saveProfile}
            disabled={saving}
            className="btn-gold"
            style={{ alignSelf: 'flex-start', padding: '10px 24px', height: 42 }}
          >
            {saving ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </div>

      <div className="panel" style={{ padding: 28 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)' }}>Assinatura</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 20 }}>
          Plano atual: <strong style={{ color: 'var(--brand-gold)' }}>{(profile?.plans as Record<string, unknown>)?.name_pt as string ?? 'Gratuito'}</strong>
        </p>
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={manageSubscription}
            className="btn-ghost"
            style={{ padding: '10px 22px', fontSize: 14 }}
          >
            Gerenciar Assinatura
          </button>
        </div>
      </div>
    </div>
  )
}
