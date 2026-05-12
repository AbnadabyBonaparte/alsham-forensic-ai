interface IconProps { size?: number; className?: string }

export function StylometricScan({ size = 24, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"
      className={className}>
      <path d="M2 12h2l2-6 3 12 3-9 2 6 2-3h4" />
      <line x1="2" y1="20" x2="22" y2="20" strokeOpacity="0.3" strokeWidth="1" />
      <line x1="2" y1="4"  x2="22" y2="4"  strokeOpacity="0.3" strokeWidth="1" />
    </svg>
  )
}
