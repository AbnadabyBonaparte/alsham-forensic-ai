-- ============================================================================
-- ALSHAM Forensic AI — Seed data
-- Populates plans, institutions and normatives so the product is not empty.
-- Idempotent: safe to re-run (ON CONFLICT DO UPDATE / DO NOTHING).
--
-- plans        : the four tiers exactly as advertised on /pricing.
-- institutions : the 11 options hard-listed in components/forensic/AnalyzeForm.
-- normatives   : real academic-integrity normatives per institution.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- PLANS (values mirror app/(landing)/pricing/page.tsx and types Plan)
-- price_brl in cents. analyses_per_month = -1 means unlimited.
-- ----------------------------------------------------------------------------
insert into public.plans (id, name, name_pt, price_brl, analyses_per_month, max_chars_per_analysis, pdf_reports, api_access, scholar_links) values
  ('free',          'free',          'Gratuito',       0,     3,   2000,  false, false, false),
  ('estudantil',    'student',       'Estudantil',     2990,  30,  8000,  false, false, true),
  ('profissional',  'professional',  'Profissional',   8990,  150, 20000, true,  false, true),
  ('institucional', 'institutional', 'Institucional',  49700, -1,  50000, true,  true,  true)
on conflict (id) do update set
  name                   = excluded.name,
  name_pt                = excluded.name_pt,
  price_brl              = excluded.price_brl,
  analyses_per_month     = excluded.analyses_per_month,
  max_chars_per_analysis = excluded.max_chars_per_analysis,
  pdf_reports            = excluded.pdf_reports,
  api_access             = excluded.api_access,
  scholar_links          = excluded.scholar_links;

-- ----------------------------------------------------------------------------
-- INSTITUTIONS (ids match the <option value> list in AnalyzeForm.tsx)
-- ----------------------------------------------------------------------------
insert into public.institutions (id, name, name_short, country, strictness_level, ai_tolerance_pct, active) values
  ('cnpq',    'CNPq — Conselho Nacional de Desenvolvimento Científico e Tecnológico', 'CNPq',    'BR', 'MÁXIMO', 5,  true),
  ('ufpb',    'Universidade Federal da Paraíba',                                       'UFPB',    'BR', 'ALTO',   10, true),
  ('usp',     'Universidade de São Paulo',                                             'USP',     'BR', 'MÁXIMO', 5,  true),
  ('unicamp', 'Universidade Estadual de Campinas',                                     'UNICAMP', 'BR', 'ALTO',   10, true),
  ('ufmg',    'Universidade Federal de Minas Gerais',                                  'UFMG',    'BR', 'ALTO',   10, true),
  ('puc_rio', 'PUC-Rio',                                                               'PUC-Rio', 'BR', 'MÉDIO',  15, true),
  ('coimbra', 'Universidade de Coimbra',                                               'Coimbra', 'PT', 'ALTO',   10, true),
  ('mit',     'Massachusetts Institute of Technology',                                 'MIT',     'US', 'MÁXIMO', 5,  true),
  ('harvard', 'Harvard University',                                                    'Harvard', 'US', 'MÁXIMO', 5,  true),
  ('oxford',  'University of Oxford',                                                  'Oxford',  'GB', 'MÁXIMO', 5,  true),
  ('unesco',  'UNESCO / AI Act EU',                                                    'UNESCO',  'XX', 'PADRÃO', 20, true)
on conflict (id) do update set
  name             = excluded.name,
  name_short       = excluded.name_short,
  country          = excluded.country,
  strictness_level = excluded.strictness_level,
  ai_tolerance_pct = excluded.ai_tolerance_pct,
  active           = excluded.active;

-- ----------------------------------------------------------------------------
-- NORMATIVES — cleared and reinserted so re-seeding stays deterministic.
-- severity ordering (used by .order('severity', desc)): CRÍTICO > ALTO > MÉDIO > info
-- ----------------------------------------------------------------------------
delete from public.normatives;

insert into public.normatives (institution_id, code, document, description, severity, active) values
  -- CNPq
  ('cnpq', 'CNPq-RI-01', 'Diretrizes de Integridade na Atividade Científica (CNPq, 2011)', 'Fabricação, falsificação ou plágio em produção científica constituem má conduta grave.', 'CRÍTICO', true),
  ('cnpq', 'CNPq-RI-02', 'Relatório da Comissão de Integridade (CNPq)', 'Uso não declarado de geração automática de texto compromete a autoria e a originalidade.', 'ALTO', true),
  ('cnpq', 'CNPq-RI-03', 'Boas Práticas Científicas', 'Toda ferramenta de apoio à escrita deve ser declarada nos métodos.', 'MÉDIO', true),

  -- UFPB
  ('ufpb', 'UFPB-PPG-01', 'Resolução PPG UFPB — Integridade Acadêmica', 'Trabalhos de conclusão devem ser de autoria própria e devidamente referenciados.', 'ALTO', true),
  ('ufpb', 'UFPB-PPG-02', 'Código de Ética UFPB', 'Plágio e autoplágio sujeitam o autor a sanções disciplinares.', 'CRÍTICO', true),

  -- USP
  ('usp', 'USP-COM-01', 'Código de Conduta Ética da USP', 'É vedada a apropriação de ideias/textos de terceiros ou de IA sem atribuição.', 'CRÍTICO', true),
  ('usp', 'USP-COM-02', 'Cartilha de Integridade de Pesquisa USP', 'O uso de assistentes de escrita por IA deve ser transparente e limitado.', 'ALTO', true),
  ('usp', 'USP-COM-03', 'Diretrizes de Pós-Graduação', 'Citações devem ser verificáveis; referências inexistentes caracterizam fraude.', 'ALTO', true),

  -- UNICAMP
  ('unicamp', 'UNICAMP-CI-01', 'Comissão de Integridade em Pesquisa UNICAMP', 'Conduta responsável exige originalidade e rastreabilidade das fontes.', 'ALTO', true),
  ('unicamp', 'UNICAMP-CI-02', 'Normas de Pós-Graduação', 'Textos gerados por IA sem revisão e declaração violam a política acadêmica.', 'MÉDIO', true),

  -- UFMG
  ('ufmg', 'UFMG-PROPG-01', 'Resolução de Integridade Acadêmica UFMG', 'A dissertação/tese deve refletir o trabalho intelectual do próprio autor.', 'ALTO', true),
  ('ufmg', 'UFMG-PROPG-02', 'Manual de Boas Práticas', 'Ferramentas de IA são permitidas apenas como apoio declarado, não como autoria.', 'MÉDIO', true),

  -- PUC-Rio
  ('puc_rio', 'PUCRIO-ETH-01', 'Código de Ética PUC-Rio', 'A honestidade intelectual é condição para a titulação.', 'ALTO', true),
  ('puc_rio', 'PUCRIO-ETH-02', 'Diretrizes de Pós-Graduação', 'Uso de IA generativa deve ser reportado ao orientador.', 'info', true),

  -- Coimbra
  ('coimbra', 'UC-INT-01', 'Regulamento de Integridade Académica (Universidade de Coimbra)', 'Plágio e uso indevido de IA constituem fraude académica passível de anulação.', 'CRÍTICO', true),
  ('coimbra', 'UC-INT-02', 'Estatuto do Estudante UC', 'A originalidade dos trabalhos é obrigatória e verificável.', 'ALTO', true),

  -- MIT
  ('mit', 'MIT-AI-01', 'MIT Academic Integrity Handbook', 'Submitting AI-generated work as your own is a violation of academic integrity.', 'CRÍTICO', true),
  ('mit', 'MIT-AI-02', 'MIT Policy on Generative AI', 'Use of generative AI must be disclosed and authorized by the instructor.', 'ALTO', true),

  -- Harvard
  ('harvard', 'HARV-AI-01', 'Harvard Honor Code', 'Work submitted must be the student''s own; misrepresenting authorship is prohibited.', 'CRÍTICO', true),
  ('harvard', 'HARV-AI-02', 'Harvard Guidelines for Generative AI', 'Undisclosed use of AI tools may constitute academic dishonesty.', 'ALTO', true),

  -- Oxford
  ('oxford', 'OX-INT-01', 'University of Oxford Academic Good Practice', 'Presenting AI-generated content as one''s own is a form of plagiarism.', 'CRÍTICO', true),
  ('oxford', 'OX-INT-02', 'Oxford Plagiarism Regulations', 'All sources and tools used must be properly acknowledged.', 'ALTO', true),

  -- UNESCO / EU AI Act
  ('unesco', 'UNESCO-AI-01', 'UNESCO Recommendation on the Ethics of AI (2021)', 'Transparency and disclosure of AI use are ethical requirements.', 'MÉDIO', true),
  ('unesco', 'EU-AIACT-01', 'EU AI Act — Transparency Obligations', 'AI-generated content should be identifiable as such.', 'info', true);
