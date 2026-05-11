export type Verdict = 'HUMAN' | 'SUSPICIOUS' | 'AI_GENERATED' | 'DEFINITIVE_AI'
export type ComplianceVerdict = 'CONFORME' | 'ALERTA' | 'VIOLAÇÃO'
export type RiskLevel = 'BAIXO' | 'MÉDIO' | 'ALTO' | 'CRÍTICO'
export type StrictnessLevel = 'MÁXIMO' | 'ALTO' | 'MÉDIO' | 'PADRÃO'

export interface AnalysisRequest {
  text: string
  institutionId: string
  pasteDetected: boolean
  pasteCharCount: number
}

export interface ParagraphResult {
  text: string
  aiScore: number
  flags: string[]
}

export interface StylemetricResult {
  perplexityScore: number
  burstiScore: number
  vocabularyRichness: number
  avgSentenceLength: number
  lexicalDiversity: number
}

export interface CitationResult {
  author: string
  title: string
  year: string | null
  full: string
  exists: boolean
  risk: 'low' | 'medium' | 'critical'
  scholarUrl: string
}

export interface ComplianceResult {
  institution: string
  verdict: ComplianceVerdict
  riskLevel: RiskLevel
  violatedNormatives: ViolatedNormative[]
}

export interface ViolatedNormative {
  code: string
  document: string
  description: string
  severity: string
}

export interface AnalysisResult {
  id: string
  overallAiScore: number
  verdict: Verdict
  detectedModel: string
  confidence: number
  paragraphs: ParagraphResult[]
  stylometric: StylemetricResult
  citations: CitationResult[]
  flags: string[]
  reverseTranslationDetected: boolean
  pasteDetected: boolean
  compliance: ComplianceResult
  forensicSummary: string
  recommendation: string
  cidCode: string
  textHash: string
  resubmissionData: {
    isResubmission: boolean
    submissionCount: number
    scoreTrend: string
  }
  createdAt: string
}

export interface Institution {
  id: string
  name: string
  nameShort: string
  country: string
  strictnessLevel: StrictnessLevel
  aiTolerancePct: number
}

export interface Plan {
  id: string
  name: string
  namePt: string
  priceBrl: number
  analysesPerMonth: number
  maxCharsPerAnalysis: number
  pdfReports: boolean
  apiAccess: boolean
  scholarLinks: boolean
}

export interface Profile {
  id: string
  email: string
  fullName: string | null
  institution: string | null
  planId: string
  analysesUsedThisMonth: number
  subscriptionStatus: string
}
