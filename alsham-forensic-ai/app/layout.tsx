import type { Metadata } from 'next'
import { Inter, IBM_Plex_Mono } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'ALSHAM Forensic AI — A auditoria forense de IA que universidades conseguem defender.',
  description:
    'Detecte texto sintético, valide citações, aplique normativas reais e emita um Certificado de Integridade Digital verificável.',
  keywords: ['detector IA', 'plágio acadêmico', 'CNPq', 'forense', 'ChatGPT detector'],
  openGraph: {
    title: 'ALSHAM Forensic AI',
    description: 'Auditoria forense de IA com conformidade CNPq 2664/2026',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${inter.variable} ${ibmPlexMono.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
