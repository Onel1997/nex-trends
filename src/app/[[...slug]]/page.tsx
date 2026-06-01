export default function Page() {
  return (
    <main
      style={{
        background: "#050505",
        color: "white",
        minHeight: "100vh",
        fontFamily: "sans-serif"
      }}
    >
      <nav
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "24px 40px",
          borderBottom: "1px solid #1f1f1f"
        }}
      >
        <h2 style={{ fontSize: "28px", fontWeight: "bold" }}>
          NexTrends
        </h2>

        <div
          style={{
            display: "flex",
            gap: "16px"
          }}
        >
          <button
            style={{
              background: "transparent",
              color: "white",
              border: "1px solid #333",
              padding: "10px 18px",
              borderRadius: "10px",
              cursor: "pointer"
            }}
          >
            Login
          </button>

          <button
            style={{
              background: "#8b5cf6",
              color: "white",
              border: "none",
              padding: "10px 18px",
              borderRadius: "10px",
              cursor: "pointer"
            }}
          >
            Kostenlos starten
          </button>
        </div>
      </nav>

      <section
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          padding: "120px 20px"
        }}
      >
        <h1
          style={{
            fontSize: "72px",
            fontWeight: "bold",
            marginBottom: "24px",
            maxWidth: "900px"
          }}
        >
          AI Marketing Suite für TikTok & Instagram
        </h1>

        <p
          style={{
            fontSize: "24px",
            opacity: 0.7,
            maxWidth: "700px",
            lineHeight: 1.6,
            marginBottom: "40px"
          }}
        >
          Entdecke virale Trends, generiere Hooks & Ad Copy
          mit KI und automatisiere deinen Content Workflow.
        </p>

        <div
          style={{
            display: "flex",
            gap: "20px",
            flexWrap: "wrap",
            justifyContent: "center"
          }}
        >
          <button
            style={{
              background: "#8b5cf6",
              color: "white",
              border: "none",
              padding: "18px 34px",
              borderRadius: "14px",
              fontSize: "18px",
              cursor: "pointer"
            }}
          >
            Kostenlos starten
          </button>

          <button
            style={{
              background: "transparent",
              color: "white",
              border: "1px solid #333",
              padding: "18px 34px",
              borderRadius: "14px",
              fontSize: "18px",
              cursor: "pointer"
            }}
          >
            Live Demo
          </button>
        </div>
      </section>
    </main>
  )
}