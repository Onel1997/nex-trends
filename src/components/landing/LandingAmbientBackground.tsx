/** Decorative background — fixed layer, does not affect document scroll height. */
export function LandingAmbientBackground() {
  return (
    <div className="landing-ambient" aria-hidden>
      <div className="landing-page-ambient" />
      <div className="landing-ambient-orb landing-ambient-orb--primary" />
      <div className="landing-ambient-orb landing-ambient-orb--secondary" />
      <div className="landing-ambient-orb landing-ambient-orb--accent" />
      <div className="landing-ambient-grid" />
    </div>
  )
}
