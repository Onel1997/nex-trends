type Variant = 'results' | 'history' | 'saved'

export function SeoTitleEmptyIllustration({
  variant = 'results',
  className,
}: {
  variant?: Variant
  className?: string
}) {
  const accent = variant === 'saved' ? '#f59e0b' : '#8b5cf6'

  return (
    <svg
      viewBox="0 0 200 140"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <defs>
        <linearGradient id="seo-empty-g1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={accent} stopOpacity="0.85" />
          <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.55" />
        </linearGradient>
      </defs>
      <ellipse cx="100" cy="128" rx="68" ry="9" fill={accent} fillOpacity="0.12" />
      <rect
        x="36"
        y="32"
        width="128"
        height="76"
        rx="14"
        fill="#09090b"
        stroke="url(#seo-empty-g1)"
        strokeWidth="1.5"
      />
      <circle cx="52" cy="52" r="10" fill="#18181b" stroke="#3f3f46" />
      <path d="M48 52h8M52 48v8" stroke={accent} strokeWidth="1.2" strokeLinecap="round" />
      <rect x="70" y="46" width="78" height="7" rx="3.5" fill="#3f3f46" />
      <rect x="70" y="60" width="92" height="5" rx="2.5" fill="#27272a" />
      <rect x="70" y="72" width="64" height="5" rx="2.5" fill="#27272a" />
      <rect x="70" y="88" width="40" height="8" rx="4" fill="url(#seo-empty-g1)" fillOpacity="0.5" />
      {variant === 'saved' && (
        <path
          d="M158 40v18c0 2-1.5 3.5-3.5 3.5h-7c-2 0-3.5-1.5-3.5-3.5V40c0-2 1.5-3.5 3.5-3.5h7c2 0 3.5 1.5 3.5 3.5z"
          fill={accent}
          fillOpacity="0.2"
          stroke={accent}
          strokeWidth="1.2"
        />
      )}
      <circle cx="28" cy="64" r="3" fill={accent} fillOpacity="0.5" className="seo-empty-spark" />
    </svg>
  )
}
