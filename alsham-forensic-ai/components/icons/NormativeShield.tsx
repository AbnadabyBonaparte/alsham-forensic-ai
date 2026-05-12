interface IconProps { size?: number; className?: string }

export function NormativeShield({ size = 24, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"
      className={className}>
      <path d="M12 2 3 6v6c0 5 4 9 9 10 5-1 9-5 9-10V6Z" />
      <line x1="8"  y1="10" x2="16" y2="10" />
      <line x1="8"  y1="13" x2="14" y2="13" />
      <line x1="8"  y1="16" x2="12" y2="16" />
    </svg>
  )
}
