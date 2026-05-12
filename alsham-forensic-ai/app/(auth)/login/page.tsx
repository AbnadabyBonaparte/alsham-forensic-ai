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
    <div style={{ width: '100%', maxWidth: 420 }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ fontSize: 10, letterSpacing: 4, color: 'var(--brand-gold)', marginBottom: 8 }}>ALSHAM FORENSIC AI</div>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)' }}>Entrar na conta</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: 8, fontSize: 14 }}>
          Sem conta?{' '}
          <Link href="/signup" style={{ color: 'var(--brand-gold)', textDecoration: 'none' }}>Criar gratuitamente</Link>
        </p>
      </div>

      <div style={{ background: 'var(--surface-600)', borderRadius: 16, padding: 32, border: '1px solid var(--border-strong)' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <Label htmlFor="email" style={{ color: 'var(--text-secondary)', fontSize: 13 }}>E-mail</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="seu@email.com"
              style={{ background: 'var(--ink-950)', border: '1px solid var(--border-strong)', color: 'var(--text-primary)', marginTop: 6 }}
            />
          </div>
          <div>
            <Label htmlFor="password" style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Senha</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="Sua senha"
              style={{ background: 'var(--ink-950)', border: '1px solid var(--border-strong)', color: 'var(--text-primary)', marginTop: 6 }}
            />
          </div>
          {error && (
            <div style={{ background: 'var(--surface-danger)', border: '1px solid var(--status-danger)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: 'var(--status-danger)' }}>
              {error}
            </div>
          )}
          <Button
            type="submit"
            disabled={loading}
            style={{ background: 'var(--brand-gold)', color: 'var(--ink-950)', fontWeight: 700, marginTop: 8 }}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>

        <div style={{ textAlign: 'center', margin: '20px 0', color: 'var(--text-muted)', fontSize: 13 }}>ou</div>

        <Button
          onClick={handleGoogle}
          variant="outline"
          style={{ width: '100%', borderColor: 'var(--border-strong)', color: 'var(--text-primary)', background: 'transparent' }}
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
