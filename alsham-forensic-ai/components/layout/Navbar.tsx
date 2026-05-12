'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Shield, Menu, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

export function Navbar() {
  const [user, setUser] = useState<{ email?: string } | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
  }, [])

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: 'rgba(10,15,30,0.95)', backdropFilter: 'blur(12px)',
      borderBottom: '1px solid #1B2A4A', padding: '0 24px',
    }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <Shield size={22} color="#C9A84C" />
          <span style={{ fontWeight: 800, color: '#F8FAFC', fontSize: 16, letterSpacing: -0.5 }}>ALSHAM</span>
          <span style={{ fontSize: 11, color: '#C9A84C', letterSpacing: 2, marginLeft: 2 }}>FORENSIC AI</span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Link href="/pricing" style={{ color: '#94A3B8', textDecoration: 'none', fontSize: 14, padding: '6px 12px' }}>Preços</Link>
          {user ? (
            <Link href="/dashboard">
              <Button style={{ background: '#C9A84C', color: '#0A0F1E', fontWeight: 700, fontSize: 13 }}>Painel</Button>
            </Link>
          ) : (
            <>
              <Link href="/login" style={{ color: '#94A3B8', textDecoration: 'none', fontSize: 14, padding: '6px 12px' }}>Entrar</Link>
              <Link href="/signup">
                <Button style={{ background: '#C9A84C', color: '#0A0F1E', fontWeight: 700, fontSize: 13 }}>Criar Conta</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
