'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Shield } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

export function Navbar() {
  const [user, setUser] = useState<{ email?: string } | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
  }, [])

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: 'rgba(8,17,31,0.95)', backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--surface-600)', padding: '0 24px',
    }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <Shield size={22} color="var(--brand-gold)" />
          <span style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: 16, letterSpacing: -0.5 }}>ALSHAM</span>
          <span style={{ fontSize: 11, color: 'var(--brand-gold)', letterSpacing: 2, marginLeft: 2 }}>FORENSIC AI</span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Link href="/pricing" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: 14, padding: '6px 12px' }}>Preços</Link>
          {user ? (
            <Link href="/dashboard">
              <Button className="btn-gold" style={{ fontSize: 13, padding: '8px 18px' }}>Painel</Button>
            </Link>
          ) : (
            <>
              <Link href="/login" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: 14, padding: '6px 12px' }}>Entrar</Link>
              <Link href="/signup">
                <Button className="btn-gold" style={{ fontSize: 13, padding: '8px 18px' }}>Criar Conta</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
