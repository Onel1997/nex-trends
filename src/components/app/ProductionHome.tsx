/**
 * Minimal production homepage — no providers, Supabase, or client routing.
 * Renders reliably on Vercel while the full SPA is temporarily disabled.
 */
export default function ProductionHome() {
  return (
    <div
      style={{
        minHeight: '100svh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1.5rem',
        background: '#09090b',
        color: '#fafafa',
        fontFamily:
          "Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
        textAlign: 'center',
      }}
    >
      <p
        style={{
          margin: 0,
          fontSize: '0.75rem',
          fontWeight: 600,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: '#a78bfa',
        }}
      >
        NexTrends
      </p>
      <h1
        style={{
          margin: '0.75rem 0 0',
          fontSize: 'clamp(1.75rem, 5vw, 2.5rem)',
          fontWeight: 700,
          lineHeight: 1.15,
          maxWidth: '20ch',
        }}
      >
        AI Marketing Suite für TikTok &amp; Instagram
      </h1>
      <p
        style={{
          margin: '1rem auto 0',
          maxWidth: '36ch',
          fontSize: '1rem',
          lineHeight: 1.6,
          color: '#a1a1aa',
        }}
      >
        Entdecke virale Trends, generiere Hooks &amp; Ad Copy mit KI — kostenlos starten.
      </p>
      <div
        style={{
          marginTop: '2rem',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.75rem',
          justifyContent: 'center',
        }}
      >
        <a
          href="/login"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0.75rem 1.5rem',
            borderRadius: '0.75rem',
            background: '#8b5cf6',
            color: '#fff',
            fontWeight: 600,
            fontSize: '0.9375rem',
            textDecoration: 'none',
          }}
        >
          Anmelden
        </a>
        <a
          href="mailto:hello@nextrends-ai.de"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0.75rem 1.5rem',
            borderRadius: '0.75rem',
            border: '1px solid #3f3f46',
            color: '#e4e4e7',
            fontWeight: 600,
            fontSize: '0.9375rem',
            textDecoration: 'none',
          }}
        >
          Kontakt
        </a>
      </div>
      <p style={{ marginTop: '3rem', fontSize: '0.75rem', color: '#52525b' }}>
        © 2026 NexTrends · nextrends-ai.de
      </p>
    </div>
  )
}
