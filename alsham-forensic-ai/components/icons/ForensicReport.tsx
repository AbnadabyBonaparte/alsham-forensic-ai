interface IconProps { size?: number; className?: string }

export function ForensicReport({ size = 24, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"
      className={className}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
      <path d="M14 2v6h6" />
      <line x1="8" y1="12" x2="13" y2="12" />
      <line x1="8" y1="15" x2="11" y2="15" />
      <circle cx="17" cy="17" r="3" />
      <path d="m19.5 19.5 1.5 1.5" />
    </svg>
  )
}
