-- ============================================================
-- ALSHAM FORENSIC AI — Supabase Schema
-- ALSHAM Global Commerce Ltda
-- ============================================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================
-- PLANS & PRICING
-- ============================================================
CREATE TABLE plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  name_pt TEXT NOT NULL,
  price_brl DECIMAL(10,2) NOT NULL,
  price_usd DECIMAL(10,2),
  analyses_per_month INTEGER NOT NULL, -- -1 = unlimited
  max_chars_per_analysis INTEGER NOT NULL,
  pdf_reports BOOLEAN DEFAULT FALSE,
  api_access BOOLEAN DEFAULT FALSE,
  bulk_upload BOOLEAN DEFAULT FALSE,
  priority_queue BOOLEAN DEFAULT FALSE,
  scholar_links BOOLEAN DEFAULT FALSE,
  custom_normatives BOOLEAN DEFAULT FALSE,
  stripe_price_id_brl TEXT,
  stripe_price_id_usd TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO plans VALUES
  ('free',          'Free',          'Gratuito',       0,      0,     3,    2000,  FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, NULL, NULL, NOW()),
  ('estudantil',    'Student',       'Estudantil',    29.90,   5.99,  30,   8000,  FALSE, FALSE, FALSE, FALSE, TRUE,  FALSE, NULL, NULL, NOW()),
  ('profissional',  'Professional',  'Profissional',  89.90,  17.99, 150,  20000, TRUE,  FALSE, FALSE, FALSE, TRUE,  FALSE, NULL, NULL, NOW()),
  ('institucional', 'Institutional', 'Institucional', 497.00, 99.00, -1,   50000, TRUE,  TRUE,  TRUE,  TRUE,  TRUE,  TRUE,  NULL, NULL, NOW());

-- ============================================================
-- USERS (extends Supabase auth.users)
-- ============================================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  institution TEXT,
  role TEXT DEFAULT 'student', -- student | professor | researcher | institution_admin
  plan_id TEXT REFERENCES plans(id) DEFAULT 'free',
  analyses_used_this_month INTEGER DEFAULT 0,
  analyses_reset_at TIMESTAMPTZ DEFAULT DATE_TRUNC('month', NOW()) + INTERVAL '1 month',
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  subscription_status TEXT DEFAULT 'active', -- active | past_due | canceled
  api_key UUID DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reset monthly usage
CREATE OR REPLACE FUNCTION reset_monthly_analyses()
RETURNS TRIGGER AS $$
BEGIN
  IF NOW() > NEW.analyses_reset_at THEN
    NEW.analyses_used_this_month := 0;
    NEW.analyses_reset_at := DATE_TRUNC('month', NOW()) + INTERVAL '1 month';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_monthly_reset
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION reset_monthly_analyses();

-- ============================================================
-- INSTITUTIONS & NORMATIVES DATABASE
-- ============================================================
CREATE TABLE institutions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  name_short TEXT,
  country TEXT NOT NULL DEFAULT 'BR',
  type TEXT NOT NULL, -- university | federal_agency | international
  strictness_level TEXT NOT NULL, -- MÁXIMO | ALTO | MÉDIO | PADRÃO
  ai_tolerance_pct INTEGER DEFAULT 0, -- % similarity threshold before violation
  legal_framework JSONB, -- { cnpq: true, mec: true, ai_act: false }
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE normatives (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  institution_id TEXT REFERENCES institutions(id),
  code TEXT NOT NULL, -- e.g. "Art. 9º, I, c"
  document TEXT NOT NULL, -- e.g. "Portaria CNPq 2664/2026"
  document_date DATE,
  document_url TEXT,
  description TEXT NOT NULL,
  category TEXT NOT NULL, -- declaration | prohibition | sanction | definition
  severity TEXT NOT NULL, -- info | warning | violation | critical
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed institutions
INSERT INTO institutions VALUES
('cnpq',     'CNPq — Conselho Nacional de Desenvolvimento Científico e Tecnológico', 'CNPq',     'BR', 'federal_agency', 'MÁXIMO', 0,  '{"cnpq":true,"mec":true}', TRUE, NOW()),
('ufpb',     'Universidade Federal da Paraíba',               'UFPB',     'BR', 'university',    'ALTO',   10, '{"cnpq":true,"mec":true}', TRUE, NOW()),
('usp',      'Universidade de São Paulo',                     'USP',      'BR', 'university',    'ALTO',   5,  '{"cnpq":true,"mec":true}', TRUE, NOW()),
('unicamp',  'Universidade Estadual de Campinas',             'UNICAMP',  'BR', 'university',    'ALTO',   5,  '{"cnpq":true,"mec":true}', TRUE, NOW()),
('ufmg',     'Universidade Federal de Minas Gerais',          'UFMG',     'BR', 'university',    'ALTO',   10, '{"cnpq":true,"mec":true}', TRUE, NOW()),
('puc_rio',  'PUC-Rio',                                       'PUC-Rio',  'BR', 'university',    'MÉDIO',  15, '{"mec":true}',             TRUE, NOW()),
('coimbra',  'Universidade de Coimbra',                       'Coimbra',  'PT', 'university',    'MÉDIO',  15, '{}',                       TRUE, NOW()),
('mit',      'Massachusetts Institute of Technology',          'MIT',      'US', 'university',    'MÁXIMO', 0,  '{}',                       TRUE, NOW()),
('harvard',  'Harvard University',                             'Harvard',  'US', 'university',    'MÁXIMO', 0,  '{}',                       TRUE, NOW()),
('oxford',   'University of Oxford',                           'Oxford',   'GB', 'university',    'MÁXIMO', 0,  '{}',                       TRUE, NOW()),
('unesco',   'UNESCO / AI Act EU (Norma Genérica)',            'UNESCO',   'XX', 'international', 'PADRÃO', 20, '{"ai_act":true}',          TRUE, NOW());

-- Seed normatives from uploaded documents
INSERT INTO normatives (institution_id, code, document, document_date, description, category, severity) VALUES
-- CNPq Portaria 2664/2026
('cnpq', 'Art. 9º, I, c', 'Portaria CNPq nº 2.664/2026', '2026-03-06',
 'Declarar o uso de ferramentas de Inteligência Artificial Generativa (IAG), de qualquer espécie e em qualquer fase do desenvolvimento da pesquisa (concepção, redação, análise de dados, submissão) especificando a ferramenta utilizada e a finalidade.',
 'declaration', 'warning'),
('cnpq', 'Art. 9º, I, d', 'Portaria CNPq nº 2.664/2026', '2026-03-06',
 'É vedada a submissão de conteúdo gerado por IAG como se fosse de autoria humana. Os autores são integralmente responsáveis pelo conteúdo final, inclusive por eventuais plágios ou imprecisões geradas pela IAG.',
 'prohibition', 'critical'),
('cnpq', 'Art. 33, II', 'Portaria CNPq nº 2.664/2026', '2026-03-06',
 'Plágio constitui infração gravíssima, sujeita às sanções do Art. 34.',
 'sanction', 'critical'),
('cnpq', 'Art. 34', 'Portaria CNPq nº 2.664/2026', '2026-03-06',
 'Sanções: suspensão de bolsas, interrupção de benefícios, impedimento de participação em fomento, suspensão do Currículo Lattes de 3 meses a 1 ano.',
 'sanction', 'critical'),
('cnpq', 'Art. 36', 'Portaria CNPq nº 2.664/2026', '2026-03-06',
 'Para dosimetria da sanção, consideram-se: natureza e gravidade, extensão dos danos, existência de dolo, fraude ou reincidência, circunstâncias agravantes ou atenuantes.',
 'definition', 'warning'),
-- UFPB Resolução 57/2025
('ufpb', 'Art. 2º, §1º, I', 'Resolução UFPB nº 57/2025', '2025-09-30',
 'Indicação explícita da ferramenta de IA utilizada, com respectiva versão e finalidade de uso, sempre que sua aplicação ultrapassar a revisão linguística ou ortográfica.',
 'declaration', 'warning'),
('ufpb', 'Art. 2º, §2º, I', 'Resolução UFPB nº 57/2025', '2025-09-30',
 'É terminantemente vedada a reprodução de textos gerados por ferramentas de IA em materiais acadêmicos, que possam resultar em mascaramento de autoria.',
 'prohibition', 'critical'),
('ufpb', 'Art. 2º, §3º', 'Resolução UFPB nº 57/2025', '2025-09-30',
 'A omissão da utilização de ferramentas de IA, ou seu uso indevido, poderá configurar infração ética.',
 'prohibition', 'violation'),
('ufpb', 'Art. 6º, IV', 'Resolução UFPB nº 57/2025', '2025-09-30',
 'Similaridade acima de 50% constitui indício relevante para instauração de processo administrativo.',
 'definition', 'critical'),
('ufpb', 'Art. 12, IV', 'Resolução UFPB nº 57/2025', '2025-09-30',
 'Sanções aplicáveis: anulação de defesa e cassação de diploma, quando cabível.',
 'sanction', 'critical');

-- ============================================================
-- ANALYSES
-- ============================================================
CREATE TABLE analyses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Input
  text_hash TEXT NOT NULL, -- SHA-256 of original text
  text_preview TEXT, -- first 200 chars for display
  text_length INTEGER NOT NULL,
  word_count INTEGER NOT NULL,
  institution_id TEXT REFERENCES institutions(id),
  
  -- Core results
  overall_ai_score INTEGER NOT NULL CHECK (overall_ai_score BETWEEN 0 AND 100),
  verdict TEXT NOT NULL CHECK (verdict IN ('HUMAN', 'SUSPICIOUS', 'AI_GENERATED', 'DEFINITIVE_AI')),
  detected_model TEXT,
  confidence DECIMAL(4,3),
  
  -- Detailed results (JSONB for flexibility)
  paragraphs JSONB,
  stylometric JSONB,
  citations JSONB,
  flags TEXT[],
  forensic_flags JSONB,
  
  -- Compliance
  compliance_verdict TEXT CHECK (compliance_verdict IN ('CONFORME', 'ALERTA', 'VIOLAÇÃO')),
  compliance_risk TEXT CHECK (compliance_risk IN ('BAIXO', 'MÉDIO', 'ALTO', 'CRÍTICO')),
  violated_normatives UUID[],
  
  -- Behavioral signals
  paste_detected BOOLEAN DEFAULT FALSE,
  keystroke_data JSONB, -- typing dynamics summary
  reverse_translation_detected BOOLEAN DEFAULT FALSE,
  
  -- Meta
  analysis_engine TEXT DEFAULT 'claude-sonnet-4', -- claude-sonnet-4 | gpt-4o | ensemble
  processing_time_ms INTEGER,
  cid_code TEXT UNIQUE, -- Certificate ID
  pdf_url TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for quick hash lookups (resubmission detection)
CREATE INDEX idx_analyses_text_hash ON analyses(text_hash);
CREATE INDEX idx_analyses_user_id ON analyses(user_id);
CREATE INDEX idx_analyses_created_at ON analyses(created_at DESC);
CREATE INDEX idx_analyses_cid_code ON analyses(cid_code);

-- Increment the caller's monthly analysis counter (called from app/api/analyze/route.ts).
-- SECURITY DEFINER so it runs regardless of the profiles RLS policy.
CREATE OR REPLACE FUNCTION increment_analyses_count(p_user_id UUID) RETURNS void AS $$
  UPDATE profiles
  SET analyses_used_this_month = analyses_used_this_month + 1,
      updated_at = NOW()
  WHERE id = p_user_id;
$$ LANGUAGE sql SECURITY DEFINER;

-- Public verification lookup by CID (called from app/verify/[cid]/page.tsx).
-- SECURITY DEFINER to bypass RLS, but exposes ONLY public-safe columns.
-- The document excerpt (text_preview) is NEVER returned. The SHA-256 text_hash
-- is intentionally included: it is a one-way digest, publicly advertised as
-- "Hash SHA-256 público e verificável", and required by the client-side
-- document-authenticity check on the verification page.
CREATE OR REPLACE FUNCTION get_public_analysis_by_cid(p_cid TEXT)
RETURNS jsonb AS $$
  SELECT jsonb_build_object(
    'cid_code',           a.cid_code,
    'overall_ai_score',   a.overall_ai_score,
    'verdict',            a.verdict,
    'detected_model',     a.detected_model,
    'compliance_verdict', a.compliance_verdict,
    'compliance_risk',    a.compliance_risk,
    'institution_name',   COALESCE(i.name_short, i.name, '—'),
    'analysis_engine',    a.analysis_engine,
    'text_hash',          a.text_hash,
    'created_at',         a.created_at
  )
  FROM analyses a
  LEFT JOIN institutions i ON i.id = a.institution_id
  WHERE a.cid_code = p_cid
  LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

-- ============================================================
-- RESUBMISSION DETECTION (Dosimetria de Sanção)
-- ============================================================
CREATE TABLE text_submission_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  text_hash TEXT NOT NULL,
  analysis_id UUID REFERENCES analyses(id),
  ai_score INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_submission_hash ON text_submission_history(text_hash);
CREATE INDEX idx_submission_user ON text_submission_history(user_id, text_hash);

-- Function: detect suspicious resubmissions (same text, falling score = bypass attempt)
CREATE OR REPLACE FUNCTION check_resubmission(p_user_id UUID, p_hash TEXT)
RETURNS JSONB AS $$
DECLARE
  v_count INTEGER;
  v_first_score INTEGER;
  v_last_score INTEGER;
BEGIN
  SELECT COUNT(*), MIN(ai_score), MAX(ai_score)
  INTO v_count, v_first_score, v_last_score
  FROM text_submission_history
  WHERE user_id = p_user_id AND text_hash = p_hash;
  
  RETURN JSONB_BUILD_OBJECT(
    'is_resubmission', v_count > 0,
    'submission_count', v_count,
    'score_trend', CASE 
      WHEN v_count > 1 AND v_last_score < v_first_score THEN 'DECLINING_BYPASS_ATTEMPT'
      WHEN v_count > 1 THEN 'RESUBMITTED'
      ELSE 'FIRST_SUBMISSION'
    END
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- CITATION VERIFICATION CACHE
-- ============================================================
CREATE TABLE citation_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  query_hash TEXT UNIQUE NOT NULL, -- hash of author+title+year
  author TEXT,
  title TEXT,
  year TEXT,
  verified BOOLEAN,
  source_url TEXT,
  crossref_doi TEXT,
  risk_level TEXT CHECK (risk_level IN ('low', 'medium', 'critical')),
  verified_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '30 days'
);

CREATE INDEX idx_citation_hash ON citation_cache(query_hash);

-- ============================================================
-- REPORTS (PDF certificates)
-- ============================================================
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  analysis_id UUID REFERENCES analyses(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  cid_code TEXT NOT NULL,
  pdf_url TEXT,
  verification_hash TEXT NOT NULL, -- SHA-256 of analysis result for QR validation
  is_public BOOLEAN DEFAULT FALSE,
  accessed_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reports_cid ON reports(cid_code);

-- ============================================================
-- USAGE TRACKING
-- ============================================================
CREATE TABLE usage_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL, -- analysis | report_download | api_call
  plan_id TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- STRIPE WEBHOOKS LOG
-- ============================================================
CREATE TABLE stripe_events (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  payload JSONB,
  processed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE text_submission_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_events ENABLE ROW LEVEL SECURITY;

-- Profiles: users see only their own
CREATE POLICY "profiles_own" ON profiles
  USING (auth.uid() = id);

-- Analyses: users see only their own; public analyses visible to all
CREATE POLICY "analyses_own" ON analyses
  USING (auth.uid() = user_id);

-- Reports: own + public
CREATE POLICY "reports_own_or_public" ON reports
  USING (auth.uid() = user_id OR is_public = TRUE);

-- Submission history: own only
CREATE POLICY "submissions_own" ON text_submission_history
  USING (auth.uid() = user_id);

-- Institutions and normatives: public read
ALTER TABLE institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE normatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "institutions_public_read" ON institutions FOR SELECT USING (TRUE);
CREATE POLICY "normatives_public_read" ON normatives FOR SELECT USING (TRUE);
CREATE POLICY "plans_public_read" ON plans FOR SELECT USING (TRUE);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
