import { createClient } from '@/lib/supabase/server'

export async function getInstitutionNormatives(institutionId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('normatives')
    .select('*')
    .eq('institution_id', institutionId)
    .eq('active', true)
    .order('severity', { ascending: false })
  return data ?? []
}

export async function getInstitutions() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('institutions')
    .select('id, name, name_short, country, strictness_level, ai_tolerance_pct')
    .eq('active', true)
    .order('country')
    .order('name')
  return data ?? []
}
