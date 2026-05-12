import { CSSProperties } from 'react';

interface IconProps { size?: number; className?: string; style?: CSSProperties }

export function CidSeal({ size = 24, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"
      className={className} style={style}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3a9 9 0 0 1 6.364 2.636" strokeDasharray="2 2" />
      <circle cx="12" cy="12" r="5" />
      <path d="m9.5 12 1.5 1.5 3-3" />
    </svg>
  )
}
