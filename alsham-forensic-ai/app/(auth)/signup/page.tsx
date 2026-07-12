'use client'
import { Suspense, useState } from 'react'
import Link from 'next/link'
import { CheckCircle } from 'lucide-react'
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
      <div className="panel above" style={{ padding: 40, textAlign: 'center', width: '100%' }}>
        <div style={{
          width: 56, height: 56, borderRadius: 16, margin: '0 auto 18px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'var(--surface-success)', border: '1px solid rgba(24,178,107,0.35)',
        }}>
          <CheckCircle size={26} style={{ color: 'var(--status-success)' }} />
        </div>
        <h2 style={{ color: 'var(--text-primary)', marginBottom: 10, fontSize: 20, fontWeight: 700 }}>Conta criada</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6 }}>Verifique seu e-mail para confirmar a conta e começar a analisar.</p>
        <Link href="/login">
          <button className="btn-ghost" style={{ marginTop: 22, padding: '10px 22px', fontSize: 13 }}>Ir para o login</button>
        </Link>
      </div>
    )
  }

  return (
    <div style={{ width: '100%' }}>
      <div style={{ textAlign: 'center', marginBottom: 26 }}>
        <div className="eyebrow" style={{ marginBottom: 12 }}>3 ANÁLISES GRATUITAS · SEM CARTÃO</div>
        <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>Criar conta gratuita</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: 8, fontSize: 14 }}>
          Já tem conta?{' '}
          <Link href="/login" style={{ color: 'var(--brand-gold)', textDecoration: 'none', fontWeight: 600 }}>Entrar</Link>
        </p>
      </div>

      <div className="panel" style={{ padding: 32 }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <Label htmlFor="name" className="field-label">Nome completo</Label>
            <Input
              id="name"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              placeholder="Seu nome"
              className="field-input"
            />
          </div>
          <div>
            <Label htmlFor="email" className="field-label">E-mail institucional</Label>
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
            <Label htmlFor="password" className="field-label">Senha (mín. 8 caracteres)</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={8}
              placeholder="Crie uma senha segura"
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
