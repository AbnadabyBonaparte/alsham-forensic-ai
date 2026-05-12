import Link from 'next/link'
import { Shield } from 'lucide-react'

export function Footer() {
  return (
    <footer style={{ background: '#0A0F1E', borderTop: '1px solid #1B2A4A', padding: '40px 24px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: 32, justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Shield size={18} color="#C9A84C" />
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#F8FAFC' }}>ALSHAM FORENSIC AI™</div>
            <div style={{ fontSize: 11, color: '#64748B' }}>ALSHAM Global Commerce Ltda</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 24 }}>
          {[
            { label: 'Preços', href: '/pricing' },
            { label: 'Entrar', href: '/login' },
            { label: 'Criar Conta', href: '/signup' },
          ].map(l => (
            <Link key={l.href} href={l.href} style={{ fontSize: 13, color: '#64748B', textDecoration: 'none' }}>{l.label}</Link>
          ))}
        </div>
        <div style={{ fontSize: 11, color: '#334155' }}>
          © {new Date().getFullYear()} ALSHAM Global Commerce Ltda · forensic.alshamglobal.com.br
        </div>
      </div>
    </footer>
  )
}
