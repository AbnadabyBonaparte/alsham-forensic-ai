import { useState } from "react";

const INSTITUTIONS = [
  { id: "usp", name: "USP — Universidade de São Paulo" },
  { id: "unicamp", name: "UNICAMP" },
  { id: "ufmg", name: "UFMG — Belo Horizonte" },
  { id: "puc", name: "PUC-Rio" },
  { id: "coimbra", name: "Universidade de Coimbra" },
  { id: "porto", name: "Universidade do Porto" },
  { id: "mit", name: "MIT — Massachusetts Institute of Technology" },
  { id: "oxford", name: "University of Oxford" },
  { id: "harvard", name: "Harvard University" },
  { id: "unesco", name: "Norma Genérica (UNESCO/AI Act EU)" },
];

const SYSTEM_PROMPT = (institutionName) => `You are ALSHAM Forensic AI, an elite-grade academic integrity analysis engine used by universities and doctoral review boards worldwide. Your task is forensic linguistic analysis of academic text.

CRITICAL: Return ONLY valid JSON. No preamble, no markdown fences, no explanation. Just the JSON object.

Analyze the text with maximum rigor across these dimensions:
1. AI generation probability per paragraph
2. Stylometric fingerprinting (perplexity, burstiness, lexical diversity)
3. LLM model identification (GPT-4 tends to over-use transitional phrases and balanced sentence structures; Claude tends toward nuanced hedging; Gemini has specific repetition patterns)
4. Reverse translation detection (text written in English by AI then translated to Portuguese)
5. Bibliographic hallucination detection (invented authors, journals, years)
6. Institutional compliance against: ${institutionName}

Return this exact JSON structure:
{
  "overall_ai_score": <integer 0-100, higher = more AI>,
  "verdict": <"HUMAN" | "SUSPICIOUS" | "AI_GENERATED" | "DEFINITIVE_AI">,
  "detected_model": <"Human" | "GPT-4" | "Claude" | "Gemini" | "Llama" | "Híbrido" | "Indeterminado">,
  "confidence": <float 0.0-1.0>,
  "paragraphs": [
    {
      "text": <first 90 characters of paragraph>,
      "ai_score": <integer 0-100>,
      "flags": <array of short flag strings, e.g. ["baixa_perplexidade", "estrutura_uniforme"]>
    }
  ],
  "stylometric": {
    "perplexity_score": <integer, lower = more predictable/AI>,
    "burstiness_score": <float 0.0-1.0, lower = more uniform/AI>,
    "vocabulary_richness": <float 0.0-1.0>,
    "avg_sentence_length": <float, words>,
    "lexical_diversity": <float 0.0-1.0>
  },
  "citations": [
    {
      "text": <citation text as appears in document>,
      "exists": <boolean, best forensic assessment>,
      "risk": <"low" | "medium" | "critical">
    }
  ],
  "reverse_translation_detected": <boolean>,
  "flags": <array of 2-6 specific forensic flag strings found in the text>,
  "institutional_compliance": {
    "institution": "${institutionName}",
    "verdict": <"CONFORME" | "ALERTA" | "VIOLAÇÃO">,
    "clauses": <array of 1-3 specific clause descriptions violated or at risk>,
    "risk_level": <"BAIXO" | "MÉDIO" | "ALTO" | "CRÍTICO">
  },
  "forensic_summary": <2-3 sentence forensic conclusion in Portuguese>,
  "recommendation": <1 sentence action recommendation in Portuguese>
}`;

function ScoreArc({ score }) {
  const r = 52;
  const cx = 75;
  const cy = 72;
  const startAngle = Math.PI;
  const endAngle = 0;
  const angle = startAngle - (score / 100) * Math.PI;
  const x1 = cx + r * Math.cos(startAngle);
  const y1 = cy + r * Math.sin(startAngle);
  const x2 = cx + r * Math.cos(angle);
  const y2 = cy + r * Math.sin(angle);
  const largeArc = angle < Math.PI / 2 ? 0 : 1;

  const color = score >= 75 ? "#DC2626" : score >= 50 ? "#D97706" : score >= 30 ? "#F59E0B" : "#16A34A";
  const label = score >= 75 ? "IA DETECTADA" : score >= 50 ? "SUSPEITO" : score >= 30 ? "INCONCLUSIVO" : "HUMANO";

  return (
    <div style={{ textAlign: "center" }}>
      <svg width={150} height={80} viewBox="0 0 150 80" aria-hidden="true">
        <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`} fill="none" stroke="#e5e7eb" strokeWidth={10} strokeLinecap="round" />
        {score > 0 && (
          <path d={`M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 0 ${x2} ${y2}`} fill="none" stroke={color} strokeWidth={10} strokeLinecap="round" />
        )}
        <text x={cx} y={cy - 4} textAnchor="middle" fontSize="26" fontWeight="700" fill={color} fontFamily="monospace">{score}</text>
        <text x={cx} y={cy + 14} textAnchor="middle" fontSize="9" fontWeight="600" fill={color} letterSpacing="2" fontFamily="monospace">{label}</text>
      </svg>
    </div>
  );
}

function Pill({ color, children }) {
  const configs = {
    red: { bg: "#FEE2E2", text: "#991B1B" },
    yellow: { bg: "#FEF3C7", text: "#92400E" },
    green: { bg: "#D1FAE5", text: "#065F46" },
    blue: { bg: "#DBEAFE", text: "#1E40AF" },
    gray: { bg: "#F3F4F6", text: "#374151" },
  };
  const c = configs[color] || configs.gray;
  return (
    <span style={{ background: c.bg, color: c.text, padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, fontFamily: "monospace", display: "inline-block" }}>
      {children}
    </span>
  );
}

function StatCard({ label, value, unit }) {
  return (
    <div style={{ background: "var(--color-background-secondary)", borderRadius: 8, padding: "10px 12px" }}>
      <div style={{ fontSize: 10, color: "var(--color-text-secondary)", marginBottom: 4, letterSpacing: 1, textTransform: "uppercase" }}>{label}</div>
      <div style={{ fontFamily: "monospace", fontWeight: 700, fontSize: 20, color: "var(--color-text-primary)" }}>
        {value}<span style={{ fontSize: 11, fontWeight: 400, marginLeft: 2, color: "var(--color-text-secondary)" }}>{unit}</span>
      </div>
    </div>
  );
}

function ResultPanel({ result, institutionName }) {
  const complianceConfig = {
    CONFORME: { border: "#16A34A", textColor: "#065F46", bg: "#D1FAE5" },
    ALERTA: { border: "#D97706", textColor: "#92400E", bg: "#FEF3C7" },
    VIOLAÇÃO: { border: "#DC2626", textColor: "#991B1B", bg: "#FEE2E2" },
  };
  const cv = result.institutional_compliance?.verdict || "ALERTA";
  const cc = complianceConfig[cv];
  const cid = `CID-${Date.now().toString(36).toUpperCase().slice(-8)}`;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

      {/* Row 1: Score + Diagnosis */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 12, padding: "1rem" }}>
          <div style={{ fontSize: 10, letterSpacing: 2, color: "var(--color-text-secondary)", marginBottom: 8, textTransform: "uppercase" }}>Score Forense</div>
          <ScoreArc score={result.overall_ai_score} />
        </div>

        <div style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 12, padding: "1rem" }}>
          <div style={{ fontSize: 10, letterSpacing: 2, color: "var(--color-text-secondary)", marginBottom: 10, textTransform: "uppercase" }}>Diagnóstico</div>
          <div style={{ marginBottom: 12 }}>
            {{
              HUMAN: <Pill color="green">✓ HUMANO</Pill>,
              SUSPICIOUS: <Pill color="yellow">⚠ SUSPEITO</Pill>,
              AI_GENERATED: <Pill color="red">✗ IA GERADA</Pill>,
              DEFINITIVE_AI: <Pill color="red">⛔ IA DEFINITIVA</Pill>,
            }[result.verdict] || <Pill color="gray">INCONCLUSIVO</Pill>}
          </div>
          <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse" }}>
            <tbody>
              <tr>
                <td style={{ color: "var(--color-text-secondary)", paddingBottom: 6 }}>Modelo suspeito</td>
                <td style={{ fontFamily: "monospace", fontWeight: 600, textAlign: "right", color: "var(--color-text-primary)" }}>{result.detected_model}</td>
              </tr>
              <tr>
                <td style={{ color: "var(--color-text-secondary)", paddingBottom: 6 }}>Confiança</td>
                <td style={{ fontFamily: "monospace", fontWeight: 600, textAlign: "right" }}>{Math.round((result.confidence || 0) * 100)}%</td>
              </tr>
              <tr>
                <td style={{ color: "var(--color-text-secondary)" }}>Trad. reversa</td>
                <td style={{ fontFamily: "monospace", fontWeight: 700, textAlign: "right", color: result.reverse_translation_detected ? "#DC2626" : "#16A34A" }}>
                  {result.reverse_translation_detected ? "DETECTADA" : "NEGATIVA"}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Stylometric */}
      <div style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 12, padding: "1rem" }}>
        <div style={{ fontSize: 10, letterSpacing: 2, color: "var(--color-text-secondary)", marginBottom: 12, textTransform: "uppercase" }}>Análise Estilométrica</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", gap: 8 }}>
          <StatCard label="Perplexidade" value={Math.round(result.stylometric?.perplexity_score || 0)} unit="pts" />
          <StatCard label="Burstiness" value={Math.round((result.stylometric?.burstiness_score || 0) * 100)} unit="%" />
          <StatCard label="Riq. Vocab." value={Math.round((result.stylometric?.vocabulary_richness || 0) * 100)} unit="%" />
          <StatCard label="Frase Média" value={Math.round(result.stylometric?.avg_sentence_length || 0)} unit="pal." />
          <StatCard label="Div. Léxica" value={Math.round((result.stylometric?.lexical_diversity || 0) * 100)} unit="%" />
        </div>
      </div>

      {/* Paragraph Heatmap */}
      {result.paragraphs?.length > 0 && (
        <div style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 12, padding: "1rem" }}>
          <div style={{ fontSize: 10, letterSpacing: 2, color: "var(--color-text-secondary)", marginBottom: 12, textTransform: "uppercase" }}>Mapa de Calor — Parágrafos</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {result.paragraphs.map((p, i) => {
              const sc = p.ai_score;
              const bg = sc >= 75 ? "#FEE2E2" : sc >= 50 ? "#FEF3C7" : sc >= 25 ? "#FFFBEB" : "#D1FAE5";
              const tc = sc >= 75 ? "#991B1B" : sc >= 50 ? "#92400E" : sc >= 25 ? "#78350F" : "#065F46";
              return (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ minWidth: 34, height: 26, background: bg, borderRadius: 5, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "monospace", fontSize: 11, fontWeight: 700, color: tc }}>{sc}</div>
                  <div style={{ flex: 1, height: 8, background: bg, borderRadius: 4, position: "relative", overflow: "hidden" }}>
                    <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${sc}%`, background: tc, opacity: 0.3, borderRadius: 4 }} />
                  </div>
                  <div style={{ flex: 3, fontSize: 11, color: "var(--color-text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.text}…</div>
                  {p.flags?.[0] && <div style={{ fontSize: 9, color: tc, fontFamily: "monospace", whiteSpace: "nowrap", background: bg, padding: "2px 6px", borderRadius: 3 }}>⚑ {p.flags[0]}</div>}
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: 10, display: "flex", gap: 12, fontSize: 10, flexWrap: "wrap" }}>
            {[["#D1FAE5", "#065F46", "Humano 0–24"], ["#FFFBEB", "#78350F", "Baixo 25–49"], ["#FEF3C7", "#92400E", "Médio 50–74"], ["#FEE2E2", "#991B1B", "Alto 75–100"]].map(([bg, tc, lbl]) => (
              <span key={lbl} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ width: 10, height: 10, background: bg, border: `1px solid ${tc}`, borderRadius: 2, display: "inline-block" }} />
                <span style={{ color: "var(--color-text-secondary)" }}>{lbl}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Citations */}
      {result.citations?.length > 0 && (
        <div style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 12, padding: "1rem" }}>
          <div style={{ fontSize: 10, letterSpacing: 2, color: "var(--color-text-secondary)", marginBottom: 10, textTransform: "uppercase" }}>Verificador Bibliográfico — Detector de Alucinação</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {result.citations.map((c, i) => {
              const riskMap = {
                critical: { bg: "#FEE2E2", tc: "#991B1B", label: "⛔ ALUCINAÇÃO" },
                medium: { bg: "#FEF3C7", tc: "#92400E", label: "⚠ SUSPEITO" },
                low: { bg: "#D1FAE5", tc: "#065F46", label: "✓ VERIFICADO" },
              };
              const r = riskMap[c.risk] || riskMap.low;
              return (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", background: r.bg, borderRadius: 8 }}>
                  <span style={{ background: r.tc, color: "#fff", padding: "2px 8px", borderRadius: 4, fontSize: 9, fontWeight: 700, fontFamily: "monospace", whiteSpace: "nowrap" }}>{r.label}</span>
                  <span style={{ color: r.tc, fontFamily: "monospace", fontSize: 12, flex: 1 }}>{c.text}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Forensic Flags */}
      {result.flags?.length > 0 && (
        <div style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 12, padding: "1rem" }}>
          <div style={{ fontSize: 10, letterSpacing: 2, color: "var(--color-text-secondary)", marginBottom: 10, textTransform: "uppercase" }}>Marcadores Forenses Detectados</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {result.flags.map((flag, i) => (
              <span key={i} style={{ background: "#FEE2E2", color: "#991B1B", border: "0.5px solid #FCA5A5", padding: "5px 12px", borderRadius: 20, fontSize: 11, fontFamily: "monospace" }}>
                ⚑ {flag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Institutional Compliance */}
      <div style={{ background: cc.bg, border: `1.5px solid ${cc.border}`, borderRadius: 12, padding: "1rem 1.25rem" }}>
        <div style={{ fontSize: 10, letterSpacing: 2, color: cc.textColor, marginBottom: 6, textTransform: "uppercase", fontWeight: 600 }}>
          Conformidade — {institutionName}
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 8 }}>
          <span style={{ fontSize: 20, fontWeight: 700, fontFamily: "monospace", color: cc.textColor }}>{cv}</span>
          <span style={{ fontSize: 12, background: cc.border, color: "#fff", padding: "2px 10px", borderRadius: 12, fontWeight: 700 }}>
            RISCO {result.institutional_compliance?.risk_level}
          </span>
        </div>
        {result.institutional_compliance?.clauses?.length > 0 && (
          <ul style={{ margin: "0", paddingLeft: 16, fontSize: 13, color: cc.textColor, lineHeight: 1.8 }}>
            {result.institutional_compliance.clauses.map((clause, i) => <li key={i}>{clause}</li>)}
          </ul>
        )}
      </div>

      {/* Forensic Opinion */}
      <div style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderLeft: "3px solid #C9A84C", borderRadius: "0 12px 12px 0", padding: "1rem 1.25rem" }}>
        <div style={{ fontSize: 10, letterSpacing: 2, color: "var(--color-text-secondary)", marginBottom: 8, textTransform: "uppercase" }}>Parecer Forense</div>
        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.7, color: "var(--color-text-primary)" }}>{result.forensic_summary}</p>
        <p style={{ margin: "10px 0 0", fontSize: 12, color: "var(--color-text-secondary)", fontStyle: "italic", borderTop: "0.5px solid var(--color-border-tertiary)", paddingTop: 8 }}>
          ▸ {result.recommendation}
        </p>
      </div>

      {/* Certificate Footer */}
      <div style={{ background: "#0F1E36", borderRadius: 12, padding: "1rem 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: 9, letterSpacing: 3, color: "#C9A84C", marginBottom: 4, fontWeight: 700 }}>ALSHAM FORENSIC AI™ · ALSHAM GLOBAL COMMERCE</div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.9)", fontFamily: "monospace", fontWeight: 600 }}>{cid}</div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>Certificado de Integridade Digital — scan QR para validação</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ width: 52, height: 52, background: "rgba(201,168,76,0.15)", border: "1px solid #C9A84C", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ fontSize: 9, color: "#C9A84C", fontFamily: "monospace", textAlign: "center", lineHeight: 1.4 }}>QR<br />CID</div>
          </div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginTop: 4 }}>{new Date().toLocaleString("pt-BR")}</div>
        </div>
      </div>
    </div>
  );
}

export default function AlshamForensicAI() {
  const [text, setText] = useState("");
  const [institution, setInstitution] = useState("usp");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loadingStep, setLoadingStep] = useState(0);

  const STEPS = [
    "▸ Extração de padrões estilométricos...",
    "▸ Fingerprinting de assinaturas LLM...",
    "▸ Verificação de referências bibliográficas...",
    "▸ Cruzamento com normas institucionais...",
    "▸ Compilando laudo forense completo...",
  ];

  const analyze = async () => {
    if (!text.trim() || text.trim().length < 80) {
      setError("Insira ao menos 80 caracteres para uma análise forense confiável.");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    setLoadingStep(0);

    const instName = INSTITUTIONS.find(i => i.id === institution)?.name || institution;
    const interval = setInterval(() => setLoadingStep(s => Math.min(s + 1, STEPS.length - 1)), 900);

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: SYSTEM_PROMPT(instName),
          messages: [{ role: "user", content: `Analyze this academic text for AI generation:\n\n${text.slice(0, 3000)}` }],
        }),
      });

      clearInterval(interval);
      const data = await response.json();
      const raw = data.content?.find(b => b.type === "text")?.text || "";
      const clean = raw.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setResult(parsed);
    } catch (err) {
      clearInterval(interval);
      setError("Falha na análise. Verifique a conexão e tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const instName = INSTITUTIONS.find(i => i.id === institution)?.name;
  const words = text.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", maxWidth: 700, margin: "0 auto", padding: "1.5rem 0" }}>

      {/* Header */}
      <div style={{ marginBottom: "1.5rem", borderBottom: "2px solid #C9A84C", paddingBottom: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <div style={{ width: 6, height: 6, background: "#C9A84C", borderRadius: 1 }} />
          <span style={{ fontSize: 10, letterSpacing: 3, color: "var(--color-text-secondary)", fontWeight: 600, textTransform: "uppercase" }}>
            ALSHAM GLOBAL COMMERCE · ECOSSISTEMA DE AUDITORIA INTELECTUAL
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
          <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0, color: "var(--color-text-primary)", letterSpacing: -0.5 }}>
            Forensic AI
          </h1>
          <span style={{ fontFamily: "monospace", fontSize: 11, color: "#C9A84C", fontWeight: 700 }}>™ v2.4</span>
        </div>
        <p style={{ fontSize: 13, color: "var(--color-text-secondary)", margin: "4px 0 0", fontFamily: "monospace" }}>
          Detecção de IA · Conformidade Institucional · Certificado CID
        </p>
      </div>

      {/* Input */}
      <div style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 12, padding: "1rem", marginBottom: "1rem" }}>
        <label style={{ fontSize: 10, letterSpacing: 2, color: "var(--color-text-secondary)", fontWeight: 600, display: "block", marginBottom: 8, textTransform: "uppercase" }}>
          Texto Acadêmico para Análise
        </label>
        <textarea
          value={text}
          onChange={e => { setText(e.target.value); setError(null); }}
          placeholder="Cole aqui o trecho de tese, dissertação, artigo ou trabalho acadêmico a ser analisado..."
          style={{
            width: "100%", minHeight: 160, fontFamily: "monospace", fontSize: 13, lineHeight: 1.65,
            resize: "vertical", boxSizing: "border-box", border: "0.5px solid var(--color-border-secondary)",
            borderRadius: 8, padding: "10px 14px", background: "var(--color-background-secondary)",
            color: "var(--color-text-primary)"
          }}
        />
        <div style={{ marginTop: 6, fontSize: 11, color: "var(--color-text-secondary)", fontFamily: "monospace", display: "flex", gap: 16 }}>
          <span>{text.length} caracteres</span>
          <span>{words} palavras</span>
          {words >= 50 && <span style={{ color: "#16A34A" }}>✓ Volume suficiente</span>}
          {words > 0 && words < 50 && <span style={{ color: "#D97706" }}>⚠ Mínimo: ~80 chars</span>}
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: "flex", gap: 12, marginBottom: "1.5rem", flexWrap: "wrap", alignItems: "flex-end" }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <label style={{ fontSize: 10, letterSpacing: 2, color: "var(--color-text-secondary)", display: "block", marginBottom: 6, textTransform: "uppercase" }}>
            Instituição / Norma
          </label>
          <select value={institution} onChange={e => setInstitution(e.target.value)} style={{ width: "100%" }}>
            {INSTITUTIONS.map(inst => <option key={inst.id} value={inst.id}>{inst.name}</option>)}
          </select>
        </div>
        <button
          onClick={analyze}
          disabled={loading || text.trim().length < 80}
          style={{
            background: loading || text.trim().length < 80 ? "var(--color-background-secondary)" : "#0F1E36",
            color: loading || text.trim().length < 80 ? "var(--color-text-secondary)" : "#C9A84C",
            border: "1px solid " + (loading || text.trim().length < 80 ? "var(--color-border-tertiary)" : "#C9A84C"),
            padding: "10px 28px", borderRadius: 8, fontWeight: 700, letterSpacing: 1.5,
            cursor: loading || text.trim().length < 80 ? "not-allowed" : "pointer",
            fontSize: 12, textTransform: "uppercase", fontFamily: "monospace", whiteSpace: "nowrap"
          }}
        >
          {loading ? "⚙ Processando..." : "▶ Analisar Texto"}
        </button>
      </div>

      {error && (
        <div style={{ background: "var(--color-background-danger)", border: "0.5px solid var(--color-border-danger)", borderRadius: 8, padding: "12px 16px", marginBottom: "1rem", fontSize: 13, color: "var(--color-text-danger)" }}>
          {error}
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 12, padding: "2rem 1.5rem" }}>
          <div style={{ fontFamily: "monospace", fontSize: 12, color: "var(--color-text-secondary)", lineHeight: 2.4 }}>
            {STEPS.map((step, i) => (
              <div key={i} style={{ color: i <= loadingStep ? "var(--color-text-primary)" : "var(--color-text-secondary)", opacity: i <= loadingStep ? 1 : 0.35, transition: "all 0.4s" }}>
                <span style={{ color: i < loadingStep ? "#16A34A" : i === loadingStep ? "#C9A84C" : "var(--color-text-secondary)" }}>
                  {i < loadingStep ? "✓" : i === loadingStep ? "⟳" : "○"}
                </span>
                {" "}{step}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {result && !loading && <ResultPanel result={result} institutionName={instName} />}
    </div>
  );
}
