interface IconProps { size?: number; className?: string }

export function BibliographicCheck({ size = 24, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"
      className={className}>
      <path d="M2 6c0-1.1.9-2 2-2h7v16H4a2 2 0 0 1-2-2Z" />
      <path d="M22 6c0-1.1-.9-2-2-2h-7v16h7a2 2 0 0 0 2-2Z" />
      <line x1="12" y1="4" x2="12" y2="20" />
      <path d="m8 9.5 1.5 1.5 3-3" strokeWidth="1.5" />
    </svg>
  )
}
