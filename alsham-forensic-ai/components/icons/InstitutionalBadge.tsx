interface IconProps { size?: number; className?: string }

export function InstitutionalBadge({ size = 24, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"
      className={className}>
      <rect x="3" y="10" width="18" height="11" rx="2" />
      <path d="M7 10V8a5 5 0 0 1 10 0v2" />
      <line x1="6"  y1="10" x2="6"  y2="21" strokeOpacity="0.4" strokeWidth="1" />
      <line x1="12" y1="10" x2="12" y2="21" strokeOpacity="0.4" strokeWidth="1" />
      <line x1="18" y1="10" x2="18" y2="21" strokeOpacity="0.4" strokeWidth="1" />
      <circle cx="18" cy="7" r="3.5" fill="currentColor" fillOpacity="0.15" />
      <path d="m16.5 7 1 1 2-2" strokeWidth="1.5" />
    </svg>
  )
}
