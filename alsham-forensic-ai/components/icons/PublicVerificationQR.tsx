interface IconProps { size?: number; className?: string }

export function PublicVerificationQR({ size = 24, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"
      className={className}>
      {/* top-left finder */}
      <rect x="3"  y="3"  width="7" height="7" rx="1" />
      <rect x="5"  y="5"  width="3" height="3" rx="0.5" fill="currentColor" strokeWidth="0" />
      {/* top-right finder */}
      <rect x="14" y="3"  width="7" height="7" rx="1" />
      <rect x="16" y="5"  width="3" height="3" rx="0.5" fill="currentColor" strokeWidth="0" />
      {/* bottom-left finder */}
      <rect x="3"  y="14" width="7" height="7" rx="1" />
      <rect x="5"  y="16" width="3" height="3" rx="0.5" fill="currentColor" strokeWidth="0" />
      {/* data dots */}
      <rect x="14" y="14" width="2" height="2" rx="0.3" fill="currentColor" strokeWidth="0" />
      <rect x="18" y="14" width="2" height="2" rx="0.3" fill="currentColor" strokeWidth="0" />
      <rect x="14" y="18" width="2" height="2" rx="0.3" fill="currentColor" strokeWidth="0" />
      <rect x="18" y="18" width="2" height="2" rx="0.3" fill="currentColor" strokeWidth="0" />
    </svg>
  )
}
