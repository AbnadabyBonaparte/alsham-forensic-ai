import { createHmac, timingSafeEqual } from 'crypto'

/**
 * Anonymous (unauthenticated) usage gate for the forensic analyzer.
 *
 * Funnel intent: try free (limited) -> hit wall -> sign up -> pay.
 * We give anonymous visitors a small number of free analyses tracked in a
 * signed, httpOnly cookie. Once the limit is reached the API answers with a
 * paywall response the frontend renders as an upgrade CTA.
 *
 * Tradeoff (documented on purpose): a cookie can be cleared by the visitor
 * (incognito, clearing storage, switching browser), so this is a *soft* funnel
 * gate, not a hard security control. That is acceptable for a free-tier teaser
 * whose only cost is a couple extra LLM calls. The signature (HMAC) only
 * prevents a visitor from *forging a lower count* to keep going forever; it
 * does not prevent them from throwing the cookie away and starting at zero.
 * If a hard cap is ever required, move the counter to the database keyed by a
 * hashed identifier (IP + UA) — heavier and with its own privacy tradeoffs.
 *
 * This module is intentionally free of Next.js / request-context imports so the
 * counting and signing logic can be unit-tested deterministically.
 */

/** Number of free analyses an anonymous visitor may run before the paywall. */
export const ANON_ANALYSIS_LIMIT = 3

/** Cookie name that stores the signed anonymous counter. */
export const ANON_COOKIE_NAME = 'alsham_anon_uses'

/** How long the anonymous counter cookie lives (30 days, in seconds). */
export const ANON_COOKIE_MAX_AGE = 60 * 60 * 24 * 30

/**
 * Resolve the HMAC secret used to sign the anonymous counter cookie.
 * Prefers an explicit secret, then reuses the Supabase service-role key (server
 * only, never shipped to the client), and finally falls back to a constant so
 * the gate still functions in local/dev without extra configuration.
 */
export function getAnonSecret(): string {
  return (
    process.env.ANON_COOKIE_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    'alsham-anon-counter-fallback-secret'
  )
}

function sign(payload: string, secret: string): string {
  return createHmac('sha256', secret).update(payload).digest('hex')
}

function safeEqualHex(a: string, b: string): boolean {
  // Both must be valid, equal-length hex to compare in constant time.
  if (a.length !== b.length || a.length === 0) return false
  try {
    return timingSafeEqual(Buffer.from(a, 'hex'), Buffer.from(b, 'hex'))
  } catch {
    return false
  }
}

/**
 * Serialize a count into a tamper-evident cookie value: `"<count>.<hmac>"`.
 */
export function serializeAnonCount(count: number, secret: string): string {
  const n = Math.max(0, Math.floor(count))
  const payload = String(n)
  return `${payload}.${sign(payload, secret)}`
}

/**
 * Parse & verify a cookie value produced by {@link serializeAnonCount}.
 * Returns the trusted count, or 0 when the cookie is missing, malformed, or the
 * signature does not verify (treated as a fresh anonymous visitor).
 */
export function parseAnonCount(raw: string | undefined | null, secret: string): number {
  if (!raw) return 0
  const idx = raw.lastIndexOf('.')
  if (idx <= 0) return 0
  const payload = raw.slice(0, idx)
  const providedSig = raw.slice(idx + 1)
  if (!/^\d+$/.test(payload)) return 0
  const expectedSig = sign(payload, secret)
  if (!safeEqualHex(providedSig, expectedSig)) return 0
  const n = Number.parseInt(payload, 10)
  return Number.isFinite(n) && n >= 0 ? n : 0
}

/** True when the anonymous visitor has used up their free analyses. */
export function isAnonLimitReached(count: number): boolean {
  return count >= ANON_ANALYSIS_LIMIT
}

/** How many free anonymous analyses remain (never negative). */
export function anonRemaining(count: number): number {
  return Math.max(0, ANON_ANALYSIS_LIMIT - count)
}
