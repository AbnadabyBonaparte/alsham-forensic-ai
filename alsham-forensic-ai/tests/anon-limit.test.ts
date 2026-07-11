import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  ANON_ANALYSIS_LIMIT,
  anonRemaining,
  isAnonLimitReached,
  parseAnonCount,
  serializeAnonCount,
} from '../lib/anon-limit.ts'

const SECRET = 'test-secret-abc'

test('serialize -> parse round-trips a count', () => {
  for (const n of [0, 1, 2, 3, 7, 42]) {
    const cookie = serializeAnonCount(n, SECRET)
    assert.equal(parseAnonCount(cookie, SECRET), n)
  }
})

test('serialized cookie has "<count>.<hmac>" shape', () => {
  const cookie = serializeAnonCount(2, SECRET)
  assert.match(cookie, /^2\.[0-9a-f]{64}$/)
})

test('parse treats missing/empty cookie as zero (fresh visitor)', () => {
  assert.equal(parseAnonCount(undefined, SECRET), 0)
  assert.equal(parseAnonCount(null, SECRET), 0)
  assert.equal(parseAnonCount('', SECRET), 0)
})

test('parse rejects a tampered count (forged lower value)', () => {
  const cookie = serializeAnonCount(3, SECRET)
  const sig = cookie.split('.')[1]
  // Attacker keeps a valid signature but swaps the payload to 0 to keep going.
  const forged = `0.${sig}`
  assert.equal(parseAnonCount(forged, SECRET), 0) // signature no longer matches -> untrusted -> 0
  // And the honest value must not survive under a different secret.
  assert.equal(parseAnonCount(cookie, 'different-secret'), 0)
})

test('parse rejects malformed values', () => {
  assert.equal(parseAnonCount('garbage', SECRET), 0)
  assert.equal(parseAnonCount('5', SECRET), 0) // no signature
  assert.equal(parseAnonCount('abc.def', SECRET), 0) // non-numeric payload
  assert.equal(parseAnonCount('-1.deadbeef', SECRET), 0)
})

test('serialize clamps negative / fractional counts', () => {
  assert.equal(parseAnonCount(serializeAnonCount(-5, SECRET), SECRET), 0)
  assert.equal(parseAnonCount(serializeAnonCount(2.9, SECRET), SECRET), 2)
})

test('isAnonLimitReached gates exactly at the limit', () => {
  assert.equal(isAnonLimitReached(0), false)
  assert.equal(isAnonLimitReached(ANON_ANALYSIS_LIMIT - 1), false)
  assert.equal(isAnonLimitReached(ANON_ANALYSIS_LIMIT), true)
  assert.equal(isAnonLimitReached(ANON_ANALYSIS_LIMIT + 5), true)
})

test('anonRemaining never goes negative', () => {
  assert.equal(anonRemaining(0), ANON_ANALYSIS_LIMIT)
  assert.equal(anonRemaining(ANON_ANALYSIS_LIMIT), 0)
  assert.equal(anonRemaining(ANON_ANALYSIS_LIMIT + 3), 0)
})

test('full funnel: N free analyses then the wall', () => {
  let cookie: string | undefined
  let allowed = 0
  for (let attempt = 0; attempt < ANON_ANALYSIS_LIMIT + 2; attempt++) {
    const used = parseAnonCount(cookie, SECRET)
    if (isAnonLimitReached(used)) break // paywall
    allowed++
    cookie = serializeAnonCount(used + 1, SECRET) // server sets incremented cookie on success
  }
  assert.equal(allowed, ANON_ANALYSIS_LIMIT)
  assert.equal(isAnonLimitReached(parseAnonCount(cookie, SECRET)), true)
})
