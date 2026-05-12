import { createClient } from '@/lib/supabase/server'
import { AnalyzeForm } from '@/components/forensic/AnalyzeForm'

export default async function AnalyzePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [recentRes, profileRes] = await Promise.all([
    supabase
      .from('analyses')
      .select('id, overall_ai_score, verdict, created_at, cid_code, institution_id')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false })
      .limit(12),
    supabase
      .from('profiles')
      .select('analyses_used_this_month, plan_id, plans(analyses_per_month, pdf_reports, max_chars_per_analysis, name_pt)')
      .eq('id', user!.id)
      .single(),
  ])

  const plan = (profileRes.data?.plans as Record<string, unknown> | null) ?? {}

  return (
    <AnalyzeForm
      recentAnalyses={recentRes.data ?? []}
      analysesUsed={profileRes.data?.analyses_used_this_month ?? 0}
      analysesLimit={(plan.analyses_per_month as number) ?? 3}
      maxChars={(plan.max_chars_per_analysis as number) ?? 2000}
      hasPdfAccess={(plan.pdf_reports as boolean) ?? false}
      planName={(plan.name_pt as string) ?? 'Gratuito'}
    />
  )
}
