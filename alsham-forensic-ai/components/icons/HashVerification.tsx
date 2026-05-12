interface IconProps { size?: number; className?: string }

export function HashVerification({ size = 24, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"
      className={className}>
      <line x1="10" y1="5" x2="8" y2="19" />
      <line x1="16" y1="5" x2="14" y2="19" />
      <line x1="6" y1="9" x2="20" y2="9" />
      <line x1="4" y1="15" x2="18" y2="15" />
      <circle cx="19" cy="19" r="3" fill="none" />
      <path d="m17.5 19 1 1 2-2" />
    </svg>
  )
}
