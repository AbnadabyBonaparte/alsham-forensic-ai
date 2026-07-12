'use client'
import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') ?? '/dashboard'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }
    router.push(redirect)
    router.refresh()
  }

  async function handleGoogle() {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback?redirect=${redirect}` },
    })
  }

  return (
    <div style={{ width: '100%' }}>
      <div style={{ textAlign: 'center', marginBottom: 26 }}>
        <div className="eyebrow" style={{ marginBottom: 12 }}>ACESSO SEGURO</div>
        <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>Entrar na conta</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: 8, fontSize: 14 }}>
          Sem conta?{' '}
          <Link href="/signup" style={{ color: 'var(--brand-gold)', textDecoration: 'none', fontWeight: 600 }}>Criar gratuitamente</Link>
        </p>
      </div>

      <div className="panel" style={{ padding: 32 }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <Label htmlFor="email" className="field-label">E-mail</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="seu@email.com"
              className="field-input"
            />
          </div>
          <div>
            <Label htmlFor="password" className="field-label">Senha</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="Sua senha"
              className="field-input"
            />
          </div>
          {error && (
            <div className="bg-danger-sf" style={{ padding: '10px 14px', fontSize: 13, color: 'var(--status-danger)' }}>
              {error}
            </div>
          )}
          <Button
            type="submit"
            disabled={loading}
            className="btn-gold"
            style={{ marginTop: 6, height: 44 }}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '22px 0' }}>
          <span style={{ flex: 1, height: 1, background: 'var(--border-soft)' }} />
          <span style={{ color: 'var(--text-muted)', fontSize: 12, fontFamily: 'var(--font-mono)' }}>ou</span>
          <span style={{ flex: 1, height: 1, background: 'var(--border-soft)' }} />
        </div>

        <Button
          onClick={handleGoogle}
          variant="outline"
          style={{ width: '100%', height: 44, borderColor: 'var(--border-strong)', color: 'var(--text-primary)', background: 'color-mix(in srgb, var(--surface-800) 60%, transparent)' }}
        >
          Continuar com Google
        </Button>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 40 }}>Carregando...</div>}>
      <LoginForm />
    </Suspense>
  )
}
