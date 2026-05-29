type Variant = 'activity' | 'trends' | 'videos'

export function DashboardEmptyIllustration({
  variant = 'activity',
  className,
}: {
  variant?: Variant
  className?: string
}) {
  const accent = variant === 'videos' ? '#d946ef' : '#8b5cf6'

  return (
    <svg
      viewBox="0 0 160 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <defs>
        <linearGradient id="dash-empty-g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={accent} stopOpacity="0.9" />
          <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.5" />
        </linearGradient>
      </defs>
      <ellipse cx="80" cy="108" rx="56" ry="8" fill={accent} fillOpacity="0.12" />
      {variant === 'videos' ? (
        <>
          <rect x="48" y="24" width="64" height="72" rx="10" fill="#09090b" stroke="url(#dash-empty-g)" strokeWidth="1.2" />
          <path d="M72 48l20 12-20 12V48z" fill={accent} fillOpacity="0.35" />
        </>
      ) : variant === 'trends' ? (
        <>
          <path d="M40 80 L60 52 L78 64 L100 36 L120 48" stroke="url(#dash-empty-g)" strokeWidth="2" strokeLinecap="round" />
          <circle cx="60" cy="52" r="4" fill={accent} fillOpacity="0.6" />
          <circle cx="100" cy="36" r="4" fill="#22d3ee" fillOpacity="0.5" />
        </>
      ) : (
        <>
          <rect x="36" y="32" width="88" height="56" rx="12" fill="#09090b" stroke="url(#dash-empty-g)" strokeWidth="1.2" />
          <rect x="48" y="44" width="48" height="6" rx="3" fill="#3f3f46" />
          <rect x="48" y="56" width="64" height="5" rx="2.5" fill="#27272a" />
          <rect x="48" y="68" width="36" height="8" rx="4" fill="url(#dash-empty-g)" fillOpacity="0.4" />
        </>
      )}
      <circle cx="28" cy="40" r="3" fill={accent} fillOpacity="0.45" className="dashboard-empty-spark" />
      <circle cx="132" cy="72" r="2.5" fill="#22d3ee" fillOpacity="0.4" className="dashboard-empty-spark animation-delay-200" />
    </svg>
  )
}
