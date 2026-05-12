interface RawCitation {
  author: string
  title: string
  year: string | null
  full: string
  exists: boolean
  risk: 'low' | 'medium' | 'critical'
}

export async function verifyCitations(citations: RawCitation[]) {
  if (!citations.length) return []

  const TAVILY_KEY = process.env.TAVILY_API_KEY
  if (!TAVILY_KEY) {
    return citations.map(c => ({ ...c, scholarUrl: buildScholarUrl(c) }))
  }

  const results = await Promise.allSettled(
    citations.map(async (citation) => {
      const query = [citation.author, citation.title, citation.year].filter(Boolean).join(' ')
      try {
        const res = await fetch('https://api.tavily.com/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            api_key: TAVILY_KEY,
            query: `academic paper "${query}"`,
            search_depth: 'basic',
            max_results: 3,
            include_domains: [
              'scholar.google.com',
              'pubmed.ncbi.nlm.nih.gov',
              'doi.org',
              'crossref.org',
              'scielo.br',
            ],
          }),
        })
        const data = await res.json() as { results?: unknown[] }
        const found = (data.results?.length ?? 0) > 0
        return {
          ...citation,
          exists: found,
          risk: (found ? 'low' : citation.risk === 'low' ? 'medium' : 'critical') as 'low' | 'medium' | 'critical',
          scholarUrl: buildScholarUrl(citation),
        }
      } catch {
        return { ...citation, scholarUrl: buildScholarUrl(citation) }
      }
    })
  )

  return results.map((r, i) =>
    r.status === 'fulfilled' ? r.value : { ...citations[i], scholarUrl: buildScholarUrl(citations[i]) }
  )
}

function buildScholarUrl(c: { author: string; title: string; year: string | null }) {
  const q = [c.author, c.title, c.year].filter(Boolean).join(' ')
  return `https://scholar.google.com/scholar?q=${encodeURIComponent(q)}`
}
