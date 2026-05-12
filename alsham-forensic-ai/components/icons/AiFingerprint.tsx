interface IconProps { size?: number; className?: string }

export function AiFingerprint({ size = 24, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"
      className={className}>
      <path d="M12 10a2 2 0 0 0-2 2c0 1.5 1 2.5 2 4" />
      <path d="M10 8.5A4 4 0 0 1 16 12c0 3-1.5 5-2.5 6.5" />
      <path d="M8 7.5A6 6 0 0 1 18 12c0 4-2 7-3.5 8.5" />
      <path d="M6.5 6.5A8 8 0 0 1 20 12c0 5-2.5 8.5-4.5 10" />
      <path d="M5 5.5A10 10 0 0 1 22 12" strokeDasharray="2 1.5" />
      <circle cx="12" cy="12" r="1" fill="currentColor" strokeWidth="0" />
      <path d="M14 4h2M17 6l1-2" strokeWidth="1.25" strokeOpacity="0.6" />
    </svg>
  )
}
