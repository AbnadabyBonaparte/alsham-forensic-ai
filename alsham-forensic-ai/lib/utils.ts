import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date) {
  return new Date(date).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function verdictLabel(verdict: string) {
  const labels: Record<string, string> = {
    HUMAN: 'Humano',
    SUSPICIOUS: 'Suspeito',
    AI_GENERATED: 'Gerado por IA',
    DEFINITIVE_AI: 'Definitivamente IA',
  }
  return labels[verdict] ?? verdict
}

export function verdictColor(verdict: string) {
  const colors: Record<string, string> = {
    HUMAN: '#16A34A',
    SUSPICIOUS: '#D97706',
    AI_GENERATED: '#DC2626',
    DEFINITIVE_AI: '#7F1D1D',
  }
  return colors[verdict] ?? '#94A3B8'
}

export function riskColor(risk: string) {
  const colors: Record<string, string> = {
    BAIXO: '#16A34A',
    MÉDIO: '#D97706',
    ALTO: '#DC2626',
    CRÍTICO: '#7F1D1D',
    low: '#16A34A',
    medium: '#D97706',
    critical: '#DC2626',
  }
  return colors[risk] ?? '#94A3B8'
}
