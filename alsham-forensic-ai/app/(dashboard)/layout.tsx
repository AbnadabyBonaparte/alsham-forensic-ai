import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardNav } from '@/components/layout/DashboardNav'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*, plans(*)')
    .eq('id', user.id)
    .single()

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-app)', display: 'flex' }}>
      <DashboardNav user={user} profile={profile} />
      {/* main has no maxWidth — each page controls its own padding/grid.
          position:relative anchors the shared ambient depth layer. */}
      <main style={{ position: 'relative', flex: 1, minWidth: 0, overflow: 'auto' }}>
        <div className="ambient-scene" aria-hidden />
        <div className="above" style={{ minHeight: '100%' }}>
          {children}
        </div>
      </main>
    </div>
  )
}
