import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date) {
  return new Date(date).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export function verdictLabel(verdict: string) {
  const labels: Record<string, string> = {
    HUMAN:         'Humano',
    SUSPICIOUS:    'Suspeito',
    AI_GENERATED:  'Gerado por IA',
    DEFINITIVE_AI: 'Definitivamente IA',
  }
  return labels[verdict] ?? verdict
}

/** Returns a CSS variable string — never a hardcoded hex. */
export function verdictColor(verdict: string): string {
  const map: Record<string, string> = {
    HUMAN:         'var(--status-success)',
    SUSPICIOUS:    'var(--status-warning)',
    AI_GENERATED:  'var(--status-danger)',
    DEFINITIVE_AI: 'var(--status-danger)',
  }
  return map[verdict] ?? 'var(--text-muted)'
}

/** Returns a CSS variable string — never a hardcoded hex. */
export function riskColor(risk: string): string {
  const map: Record<string, string> = {
    BAIXO:    'var(--status-success)',
    'MÉDIO':  'var(--status-warning)',
    ALTO:     'var(--status-danger)',
    'CRÍTICO':'var(--status-danger)',
    low:      'var(--status-success)',
    medium:   'var(--status-warning)',
    critical: 'var(--status-danger)',
  }
  return map[risk] ?? 'var(--text-muted)'
}
