/** Decorative background — in-flow layer behind content; never captures taps. */
export function LandingAmbientBackground() {
  return (
    <div
      className="landing-ambient landing-decor-layer"
      aria-hidden
      inert
      data-decor="ambient"
    >
      <div className="landing-page-ambient landing-decor-layer" />
      <div className="landing-ambient-orb landing-ambient-orb--primary landing-decor-layer" />
      <div className="landing-ambient-orb landing-ambient-orb--secondary landing-decor-layer" />
      <div className="landing-ambient-orb landing-ambient-orb--accent landing-decor-layer" />
      <div className="landing-ambient-grid landing-decor-layer" />
    </div>
  )
}
