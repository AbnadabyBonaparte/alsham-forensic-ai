const activeAnalyses = new Map<string, boolean>()

export function acquireLock(key: string): boolean {
  if (activeAnalyses.get(key)) return false
  activeAnalyses.set(key, true)
  setTimeout(() => activeAnalyses.delete(key), 90_000)
  return true
}

export function releaseLock(key: string) {
  activeAnalyses.delete(key)
}
