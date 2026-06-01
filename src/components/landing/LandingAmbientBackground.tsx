/** Fixed animated purple gradient layer — used behind all landing sections. */
export function LandingAmbientBackground() {
  return (
    <div className="landing-ambient pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
      <div className="landing-page-ambient absolute inset-0" />
      <div className="landing-ambient-orb landing-ambient-orb--primary" />
      <div className="landing-ambient-orb landing-ambient-orb--secondary" />
      <div className="landing-ambient-orb landing-ambient-orb--accent" />
      <div className="landing-ambient-grid absolute inset-0" />
    </div>
  )
}
