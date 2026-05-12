'use client'
import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

function SignupForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const plan = searchParams.get('plan') ?? 'free'
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }
    if (plan !== 'free') {
      router.push(`/pricing?plan=${plan}`)
    } else {
      setSuccess(true)
    }
    setLoading(false)
  }

  if (success) {
    return (
      <div style={{ textAlign: 'center', maxWidth: 420 }}>
        <div style={{ fontSize: 48, marginBottom: 16, color: 'var(--status-success)' }}>✓</div>
        <h2 style={{ color: 'var(--status-success)', marginBottom: 8 }}>Conta criada!</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Verifique seu e-mail para confirmar a conta e começar a analisar.</p>
      </div>
    )
  }

  return (
    <div style={{ width: '100%', maxWidth: 420 }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ fontSize: 10, letterSpacing: 4, color: 'var(--brand-gold)', marginBottom: 8 }}>ALSHAM FORENSIC AI</div>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)' }}>Criar conta gratuita</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: 8, fontSize: 14 }}>
          Já tem conta?{' '}
          <Link href="/login" style={{ color: 'var(--brand-gold)', textDecoration: 'none' }}>Entrar</Link>
        </p>
      </div>

      <div style={{ background: 'var(--surface-600)', borderRadius: 16, padding: 32, border: '1px solid var(--border-strong)' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <Label htmlFor="name" style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Nome completo</Label>
            <Input
              id="name"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              placeholder="Seu nome"
              style={{ background: 'var(--ink-950)', border: '1px solid var(--border-strong)', color: 'var(--text-primary)', marginTop: 6 }}
            />
          </div>
          <div>
            <Label htmlFor="email" style={{ color: 'var(--text-secondary)', fontSize: 13 }}>E-mail institucional</Label>
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
            <Label htmlFor="password" style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Senha (mín. 8 caracteres)</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={8}
              placeholder="Crie uma senha segura"
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
            {loading ? 'Criando conta...' : 'Criar Conta Gratuita'}
          </Button>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center' }}>
            Ao criar conta, você concorda com nossos termos de uso.
          </p>
        </form>
      </div>
    </div>
  )
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 40 }}>Carregando...</div>}>
      <SignupForm />
    </Suspense>
  )
}
