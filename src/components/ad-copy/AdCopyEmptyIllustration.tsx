type Variant = 'results' | 'history' | 'saved'

export function AdCopyEmptyIllustration({
  variant = 'results',
  className,
}: {
  variant?: Variant
  className?: string
}) {
  const accent = variant === 'saved' ? '#f59e0b' : '#8b5cf6'
  const accent2 = variant === 'saved' ? '#fbbf24' : '#d946ef'

  return (
    <svg
      viewBox="0 0 200 140"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <defs>
        <linearGradient id="ad-empty-g1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={accent} stopOpacity="0.85" />
          <stop offset="100%" stopColor={accent2} stopOpacity="0.65" />
        </linearGradient>
        <linearGradient id="ad-empty-floor" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#18181b" stopOpacity="0" />
          <stop offset="100%" stopColor={accent} stopOpacity="0.2" />
        </linearGradient>
      </defs>

      <ellipse cx="100" cy="128" rx="70" ry="10" fill="url(#ad-empty-floor)" />

      {/* Card stack */}
      <rect
        x="48"
        y="36"
        width="104"
        height="72"
        rx="12"
        fill="#18181b"
        stroke="#3f3f46"
        strokeWidth="1"
        opacity="0.55"
        transform="rotate(-4 100 72)"
      />
      <rect
        x="44"
        y="28"
        width="112"
        height="80"
        rx="14"
        fill="#09090b"
        stroke="url(#ad-empty-g1)"
        strokeWidth="1.5"
      />

      {/* Headline bar */}
      <rect x="56" y="42" width="72" height="8" rx="4" fill="#3f3f46" />
      <rect x="56" y="56" width="88" height="6" rx="3" fill="#27272a" />
      <rect x="56" y="68" width="76" height="6" rx="3" fill="#27272a" />

      {/* CTA pill */}
      <rect x="56" y="84" width="44" height="12" rx="6" fill="url(#ad-empty-g1)" fillOpacity="0.45" />

      {/* Badges */}
      <rect x="56" y="102" width="28" height="6" rx="3" fill="#3f3f46" />
      <rect x="90" y="102" width="32" height="6" rx="3" fill="#27272a" />

      {variant === 'history' && (
        <circle cx="158" cy="48" r="14" fill="#18181b" stroke="url(#ad-empty-g1)" strokeWidth="1.2" />
      )}
      {variant === 'history' && (
        <path
          d="M154 48h8M158 44v8"
          stroke={accent}
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.8"
        />
      )}

      {variant === 'saved' && (
        <path
          d="M158 42v16c0 2-1.5 3.5-3.5 3.5h-7c-2 0-3.5-1.5-3.5-3.5V42c0-2 1.5-3.5 3.5-3.5h7c2 0 3.5 1.5 3.5 3.5z"
          fill={accent}
          fillOpacity="0.25"
          stroke={accent}
          strokeWidth="1.2"
        />
      )}

      <circle cx="32" cy="44" r="4" fill={accent} fillOpacity="0.45" className="ad-copy-empty-spark" />
      <circle
        cx="172"
        cy="88"
        r="3"
        fill={accent2}
        fillOpacity="0.4"
        className="ad-copy-empty-spark animation-delay-200"
      />
    </svg>
  )
}
