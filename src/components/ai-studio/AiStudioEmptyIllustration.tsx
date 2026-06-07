/** Decorative empty-state graphic for AI Video Studio */
export function AiStudioEmptyIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <defs>
        <linearGradient id="studio-empty-g1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#d946ef" stopOpacity="0.7" />
        </linearGradient>
        <linearGradient id="studio-empty-g2" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#18181b" stopOpacity="0" />
          <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.25" />
        </linearGradient>
        <filter id="studio-empty-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="8" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <ellipse cx="100" cy="140" rx="72" ry="12" fill="url(#studio-empty-g2)" />
      <rect
        x="62"
        y="24"
        width="76"
        height="108"
        rx="14"
        fill="#18181b"
        stroke="url(#studio-empty-g1)"
        strokeWidth="1.5"
        filter="url(#studio-empty-glow)"
      />
      <rect x="70" y="32" width="60" height="72" rx="8" fill="#09090b" />
      <circle cx="100" cy="68" r="18" fill="url(#studio-empty-g1)" fillOpacity="0.35" />
      <path
        d="M94 68 L100 62 L106 68 L100 74 Z"
        fill="white"
        fillOpacity="0.9"
        transform="translate(0, 2)"
      />
      <rect x="78" y="112" width="44" height="6" rx="3" fill="#3f3f46" />
      <rect x="88" y="122" width="24" height="4" rx="2" fill="#52525b" />
      <circle cx="36" cy="52" r="6" fill="#8b5cf6" fillOpacity="0.5" className="studio-empty-spark" />
      <circle cx="168" cy="44" r="4" fill="#d946ef" fillOpacity="0.45" className="studio-empty-spark animation-delay-200" />
      <circle cx="172" cy="96" r="5" fill="#8b5cf6" fillOpacity="0.35" className="studio-empty-spark animation-delay-400" />
    </svg>
  )
}
