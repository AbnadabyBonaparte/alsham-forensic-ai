import { CSSProperties } from 'react';

interface IconProps { size?: number; className?: string; style?: CSSProperties }

export function RiskEscalation({ size = 24, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"
      className={className} style={style}>
      <rect x="3"  y="14" width="4" height="7" rx="1" />
      <rect x="10" y="9"  width="4" height="12" rx="1" />
      <rect x="17" y="4"  width="4" height="17" rx="1" />
      <path d="m15 2 3 2-3 2" strokeWidth="1.5" />
      <path d="M18 4H12" strokeWidth="1.5" />
      <circle cx="5"  cy="12" r="1" fill="currentColor" strokeWidth="0" />
      <circle cx="12" cy="7"  r="1" fill="currentColor" strokeWidth="0" />
    </svg>
  )
}
