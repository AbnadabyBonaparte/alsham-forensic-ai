'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function LoginPage() {
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
        <div style={{ fontSize: 10, letterSpacing: 4, color: '#C9A84C', marginBottom: 8 }}>ALSHAM FORENSIC AI</div>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#F8FAFC' }}>Entrar na conta</h1>
        <p style={{ color: '#94A3B8', marginTop: 8, fontSize: 14 }}>
          Sem conta?{' '}
          <Link href="/signup" style={{ color: '#C9A84C', textDecoration: 'none' }}>Criar gratuitamente</Link>
        </p>
      </div>

      <div style={{ background: '#1B2A4A', borderRadius: 16, padding: 32, border: '1px solid #2D3A56' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <Label htmlFor="email" style={{ color: '#94A3B8', fontSize: 13 }}>E-mail</Label>
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
            <Label htmlFor="password" style={{ color: '#94A3B8', fontSize: 13 }}>Senha</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="Sua senha"
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
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>

        <div style={{ textAlign: 'center', margin: '20px 0', color: '#4B5563', fontSize: 13 }}>ou</div>

        <Button
          onClick={handleGoogle}
          variant="outline"
          style={{ width: '100%', borderColor: '#2D3A56', color: '#F8FAFC', background: 'transparent' }}
        >
          Continuar com Google
        </Button>
      </div>
    </div>
  )
}
