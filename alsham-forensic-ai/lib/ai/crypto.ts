export function generateCID(): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `ALSHAM-${timestamp}-${random}`
}

export async function hashText(text: string): Promise<string> {
  if (typeof crypto === 'undefined' || !crypto.subtle) {
    const { createHash } = await import('crypto')
    return createHash('sha256').update(text).digest('hex')
  }
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}
