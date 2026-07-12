import Link from 'next/link'
import { Shield } from 'lucide-react'

export function Footer() {
  return (
    <footer style={{ background: 'var(--ink-950)', borderTop: '1px solid var(--border-soft)', padding: '44px 24px' }}>
      <hr className="rule-gold" style={{ maxWidth: 1100, margin: '0 auto 36px' }} />
      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: 32, justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Shield size={18} color="var(--brand-gold)" />
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>ALSHAM FORENSIC AI™</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>ALSHAM Global Commerce Ltda</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 24 }}>
          {[
            { label: 'Preços', href: '/pricing' },
            { label: 'Entrar', href: '/login' },
            { label: 'Criar Conta', href: '/signup' },
          ].map(l => (
            <Link key={l.href} href={l.href} style={{ fontSize: 13, color: 'var(--text-muted)', textDecoration: 'none' }}>{l.label}</Link>
          ))}
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
          © {new Date().getFullYear()} ALSHAM Global Commerce Ltda · forensic.alshamglobal.com.br
        </div>
      </div>
    </footer>
  )
}
