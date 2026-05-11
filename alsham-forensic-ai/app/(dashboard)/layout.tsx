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
    <div style={{ minHeight: '100vh', background: '#0A0F1E', display: 'flex' }}>
      <DashboardNav user={user} profile={profile} />
      <main style={{ flex: 1, padding: '32px', maxWidth: 1100, margin: '0 auto', width: '100%' }}>
        {children}
      </main>
    </div>
  )
}
