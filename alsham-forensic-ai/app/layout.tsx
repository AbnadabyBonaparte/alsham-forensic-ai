import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })

export const metadata: Metadata = {
  title: 'ALSHAM Forensic AI — Detecção Forense de IA Acadêmica',
  description:
    'O único detector forense com conformidade CNPq 2664/2026 e UFPB 57/2025. Certificado de Integridade Digital com hash SHA-256 verifyável.',
  keywords: ['detector IA', 'plagíato acadêmico', 'CNPq', 'forense', 'ChatGPT detector'],
  openGraph: {
    title: 'ALSHAM Forensic AI',
    description: 'Detecção forense de IA com conformidade CNPq 2664/2026',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
