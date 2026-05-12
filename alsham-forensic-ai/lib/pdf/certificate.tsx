import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
} from '@react-pdf/renderer'
import type { AnalysisResult } from '@/types'

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#0A0F1E',
    padding: 40,
    fontFamily: 'Helvetica',
    color: '#F8FAFC',
  },
  header: {
    borderBottom: '1px solid #C9A84C',
    paddingBottom: 16,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brandName: { fontSize: 9, letterSpacing: 3, color: '#C9A84C' },
  certTitle: { fontSize: 14, fontWeight: 'bold', color: '#F8FAFC', marginTop: 4 },
  cidBlock: {
    backgroundColor: '#1B2A4A',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  cidLabel: { fontSize: 8, letterSpacing: 3, color: '#94A3B8', marginBottom: 6 },
  cidCode: { fontSize: 18, fontWeight: 'bold', color: '#C9A84C', letterSpacing: 2 },
  scoreBlock: {
    backgroundColor: '#1B2A4A',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  scoreNum: { fontSize: 36, fontWeight: 'bold' },
  label: { fontSize: 8, letterSpacing: 2, color: '#94A3B8', marginBottom: 3 },
  value: { fontSize: 12, color: '#F8FAFC' },
  section: {
    backgroundColor: '#1B2A4A',
    borderRadius: 8,
    padding: 14,
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 8, letterSpacing: 2, color: '#C9A84C', marginBottom: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  rowLabel: { fontSize: 10, color: '#94A3B8' },
  rowValue: { fontSize: 10, color: '#F8FAFC' },
  normativeItem: {
    borderLeft: '2px solid #DC2626',
    paddingLeft: 8,
    marginBottom: 8,
  },
  normativeCode: { fontSize: 9, color: '#C9A84C' },
  normativeDesc: { fontSize: 8, color: '#94A3B8', marginTop: 2 },
  hashBlock: {
    backgroundColor: '#0A0F1E',
    borderRadius: 4,
    padding: 8,
    marginTop: 8,
  },
  hashText: { fontSize: 7, color: '#64748B', fontFamily: 'Helvetica', letterSpacing: 1 },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    borderTop: '1px solid #1B2A4A',
    paddingTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerText: { fontSize: 7, color: '#334155' },
})

function verdictColor(verdict: string) {
  const map: Record<string, string> = {
    HUMAN: '#16A34A',
    SUSPICIOUS: '#D97706',
    AI_GENERATED: '#DC2626',
    DEFINITIVE_AI: '#7F1D1D',
  }
  return map[verdict] ?? '#94A3B8'
}

interface CertProps {
  result: AnalysisResult
  institutionName: string
}

function Certificate({ result, institutionName }: CertProps) {
  const color = verdictColor(result.verdict)
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.brandName}>ALSHAM GLOBAL COMMERCE · FORENSIC AI</Text>
            <Text style={styles.certTitle}>Certificado de Integridade Digital</Text>
          </View>
          <Text style={{ fontSize: 9, color: '#64748B' }}>
            {new Date(result.createdAt).toLocaleString('pt-BR')}
          </Text>
        </View>

        {/* CID */}
        <View style={styles.cidBlock}>
          <Text style={styles.cidLabel}>CÓDIGO DO CERTIFICADO</Text>
          <Text style={styles.cidCode}>{result.cidCode}</Text>
        </View>

        {/* Score + Verdict */}
        <View style={styles.scoreBlock}>
          <View>
            <Text style={[styles.scoreNum, { color }]}>{result.overallAiScore}</Text>
            <Text style={{ fontSize: 8, color: '#94A3B8' }}>SCORE DE IA</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ fontSize: 14, fontWeight: 'bold', color }}>{result.verdict}</Text>
            <Text style={{ fontSize: 9, color: '#94A3B8', marginTop: 2 }}>VEREDITO</Text>
            <Text style={{ fontSize: 10, color: '#F8FAFC', marginTop: 4 }}>Modelo: {result.detectedModel}</Text>
            <Text style={{ fontSize: 9, color: '#94A3B8', marginTop: 2 }}>Confiança: {(result.confidence * 100).toFixed(0)}%</Text>
          </View>
        </View>

        {/* Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>INFORMAÇÕES DA ANÁLISE</Text>
          {[
            ['Instituição', institutionName],
            ['Conformidade', result.compliance.verdict],
            ['Nível de Risco', result.compliance.riskLevel],
            ['Tradução Reversa', result.reverseTranslationDetected ? 'Detectada' : 'Não detectada'],
            ['Cole-e-cola Detectado', result.pasteDetected ? 'Sim' : 'Não'],
          ].map(([k, v]) => (
            <View key={k} style={styles.row}>
              <Text style={styles.rowLabel}>{k}</Text>
              <Text style={styles.rowValue}>{v}</Text>
            </View>
          ))}
        </View>

        {/* Normatives violated */}
        {result.compliance.violatedNormatives.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>NORMATIVAS VERIFICADAS</Text>
            {result.compliance.violatedNormatives.slice(0, 4).map((n, i) => (
              <View key={i} style={styles.normativeItem}>
                <Text style={styles.normativeCode}>{n.code} — {n.document}</Text>
                <Text style={styles.normativeDesc}>{n.description.slice(0, 120)}...</Text>
              </View>
            ))}
          </View>
        )}

        {/* Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>LAUDO FORENSE</Text>
          <Text style={{ fontSize: 10, color: '#CBD5E1', lineHeight: 1.5 }}>{result.forensicSummary}</Text>
        </View>

        {/* Hash */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>VERIFICAÇÃO CRIPTOGRÁFICA</Text>
          <View style={styles.hashBlock}>
            <Text style={styles.hashText}>SHA-256: {result.textHash}</Text>
          </View>
          <Text style={{ fontSize: 8, color: '#64748B', marginTop: 6 }}>
            Verificar em: {process.env.NEXT_PUBLIC_APP_URL}/verify/{result.cidCode}
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>ALSHAM FORENSIC AI™ · forensic.alshamglobal.com.br</Text>
          <Text style={styles.footerText}>Motor: Claude claude-sonnet-4 + GPT-4o-mini Ensemble</Text>
          <Text style={styles.footerText}>ALSHAM Global Commerce Ltda</Text>
        </View>
      </Page>
    </Document>
  )
}

export async function generateCertificatePDF(result: AnalysisResult, institutionName: string): Promise<Buffer> {
  const doc = <Certificate result={result} institutionName={institutionName} />
  const blob = await pdf(doc).toBlob()
  const arrayBuffer = await blob.arrayBuffer()
  return Buffer.from(arrayBuffer)
}
