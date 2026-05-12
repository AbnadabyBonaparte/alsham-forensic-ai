'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function SignupPage() {
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
        <div style={{ fontSize: 48, marginBottom: 16 }}>&#10003;</div>
        <h2 style={{ color: '#16A34A', marginBottom: 8 }}>Conta criada!</h2>
        <p style={{ color: '#94A3B8' }}>Verifique seu e-mail para confirmar a conta e começar a analisar.</p>
      </div>
    )
  }

  return (
    <div style={{ width: '100%', maxWidth: 420 }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ fontSize: 10, letterSpacing: 4, color: '#C9A84C', marginBottom: 8 }}>ALSHAM FORENSIC AI</div>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#F8FAFC' }}>Criar conta gratuita</h1>
        <p style={{ color: '#94A3B8', marginTop: 8, fontSize: 14 }}>
          Já tem conta?{' '}
          <Link href="/login" style={{ color: '#C9A84C', textDecoration: 'none' }}>Entrar</Link>
        </p>
      </div>

      <div style={{ background: '#1B2A4A', borderRadius: 16, padding: 32, border: '1px solid #2D3A56' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <Label htmlFor="name" style={{ color: '#94A3B8', fontSize: 13 }}>Nome completo</Label>
            <Input
              id="name"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              placeholder="Seu nome"
              style={{ background: '#0A0F1E', border: '1px solid #2D3A56', color: '#F8FAFC', marginTop: 6 }}
            />
          </div>
          <div>
            <Label htmlFor="email" style={{ color: '#94A3B8', fontSize: 13 }}>E-mail institucional</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="seu@email.com"
              style={{ background: '#0A0F1E', border: '1px solid #2D3A56', color: '#F8FAFC', marginTop: 6 }}
            />
          </div>
          <div>
            <Label htmlFor="password" style={{ color: '#94A3B8', fontSize: 13 }}>Senha (mín. 8 caracteres)</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={8}
              placeholder="Crie uma senha segura"
              style={{ background: '#0A0F1E', border: '1px solid #2D3A56', color: '#F8FAFC', marginTop: 6 }}
            />
          </div>
          {error && (
            <div style={{ background: '#7F1D1D', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#FCA5A5' }}>
              {error}
            </div>
          )}
          <Button
            type="submit"
            disabled={loading}
            style={{ background: '#C9A84C', color: '#0A0F1E', fontWeight: 700, marginTop: 8 }}
          >
            {loading ? 'Criando conta...' : 'Criar Conta Gratuita'}
          </Button>
          <p style={{ fontSize: 11, color: '#64748B', textAlign: 'center' }}>
            Ao criar conta, você concorda com nossos termos de uso.
          </p>
        </form>
      </div>
    </div>
  )
}
