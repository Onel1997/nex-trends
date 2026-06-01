export default function Page() {
  return (
    <main
      style={{
        background: "#050505",
        color: "white",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "40px",
        textAlign: "center",
        fontFamily: "sans-serif"
      }}
    >
      <h1
        style={{
          fontSize: "64px",
          fontWeight: "bold",
          marginBottom: "20px"
        }}
      >
        NexTrends
      </h1>

      <p
        style={{
          fontSize: "24px",
          maxWidth: "700px",
          opacity: 0.8,
          marginBottom: "40px"
        }}
      >
        AI Marketing Suite für TikTok & Instagram
      </p>

      <div
        style={{
          display: "flex",
          gap: "20px"
        }}
      >
        <button
          style={{
            background: "#8b5cf6",
            border: "none",
            color: "white",
            padding: "16px 32px",
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
            border: "1px solid #444",
            color: "white",
            padding: "16px 32px",
            borderRadius: "14px",
            fontSize: "18px",
            cursor: "pointer"
          }}
        >
          Demo ansehen
        </button>
      </div>
    </main>
  )
}