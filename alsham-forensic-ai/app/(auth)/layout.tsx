import Link from 'next/link'
import { Shield } from 'lucide-react'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        position: 'relative',
        minHeight: '100vh',
        background: 'var(--bg-app)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 24px',
        overflow: 'hidden',
      }}
    >
      {/* shared gallery-grade depth */}
      <div className="ambient-scene" aria-hidden />
      {/* volumetric glow behind the card */}
      <div className="hero-glow" aria-hidden style={{ top: '46%' }} />

      <div className="above" style={{ width: '100%', maxWidth: 420, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Link href="/" className="brand-lockup" style={{ marginBottom: 30 }}>
          <Shield size={22} color="var(--brand-gold)" />
          <span className="brand-name">ALSHAM</span>
          <span className="brand-tag">FORENSIC AI</span>
        </Link>
        {children}
        <Link
          href="/"
          style={{ marginTop: 28, fontSize: 12.5, color: 'var(--text-muted)', textDecoration: 'none', fontFamily: 'var(--font-mono)', letterSpacing: '0.04em' }}
        >
          ← Voltar ao início
        </Link>
      </div>
    </div>
  )
}
