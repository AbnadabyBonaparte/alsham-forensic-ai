interface IconProps { size?: number; className?: string }

export function ResubmissionTrail({ size = 24, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"
      className={className}>
      <circle cx="5"  cy="12" r="2.5" />
      <circle cx="12" cy="12" r="2.5" />
      <circle cx="19" cy="12" r="2.5" />
      <path d="M7.5 12h2" />
      <path d="M14.5 12h2" />
      <path d="M17 7c2.5 0 4 2 4 5" />
      <path d="m18.5 5.5 1.5 1.5-1.5 1.5" />
    </svg>
  )
}
