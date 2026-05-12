'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Shield, LayoutDashboard, FileSearch, Settings, LogOut, CreditCard } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface DashboardNavProps {
  user: { email?: string } | null
  profile: { full_name?: string; plans?: Record<string, unknown> } | null
}

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Painel', icon: LayoutDashboard },
  { href: '/analyze', label: 'Nova Análise', icon: FileSearch },
  { href: '/pricing', label: 'Planos', icon: CreditCard },
  { href: '/settings', label: 'Configurações', icon: Settings },
]

export function DashboardNav({ user, profile }: DashboardNavProps) {
  const pathname = usePathname()
  const router = useRouter()

  async function signOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <aside style={{
      width: 220, minHeight: '100vh', background: 'var(--surface-800)',
      borderRight: '1px solid var(--surface-600)', padding: '24px 12px',
      display: 'flex', flexDirection: 'column',
    }}>
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 32, textDecoration: 'none', padding: '0 8px' }}>
        <Shield size={18} color="var(--brand-gold)" />
        <span style={{ fontWeight: 800, fontSize: 14, color: 'var(--text-primary)' }}>ALSHAM</span>
      </Link>

      <nav style={{ flex: 1 }}>
        {NAV_ITEMS.map(item => {
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px', borderRadius: 8, marginBottom: 4,
                background: active ? 'var(--surface-600)' : 'transparent',
                color: active ? 'var(--brand-gold)' : 'var(--text-secondary)',
                textDecoration: 'none', fontSize: 14,
                transition: 'background 0.15s',
              }}
            >
              <item.icon size={16} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div style={{ borderTop: '1px solid var(--surface-600)', paddingTop: 16 }}>
        <div style={{ padding: '0 12px', marginBottom: 12 }}>
          <div style={{ fontSize: 12, color: 'var(--text-primary)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {profile?.full_name ?? user?.email}
          </div>
          <div style={{ fontSize: 11, color: 'var(--brand-gold)', marginTop: 2 }}>
            {(profile?.plans as Record<string, unknown>)?.name_pt as string ?? 'Gratuito'}
          </div>
        </div>
        <button
          onClick={signOut}
          style={{
            display: 'flex', alignItems: 'center', gap: 10, width: '100%',
            padding: '10px 12px', borderRadius: 8, background: 'transparent',
            color: 'var(--text-muted)', border: 'none', cursor: 'pointer', fontSize: 14,
          }}
        >
          <LogOut size={16} />
          Sair
        </button>
      </div>
    </aside>
  )
}
