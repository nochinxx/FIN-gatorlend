const checklist = [
  "Connect Crossmark through the wallet adapter boundary",
  "Validate Supabase textbook metadata against XRPL XLS-20 state before rendering detail views",
  "Keep issuer and privileged XRPL flows out of client code",
  "Apply RLS policies before exposing public data"
];

export default function HomePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "3rem 1.5rem"
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: 900,
          padding: "2rem",
          borderRadius: 24,
          background: "linear-gradient(180deg, #fffaf0 0%, #efe4cf 100%)",
          boxShadow: "0 24px 80px rgba(18, 33, 23, 0.12)"
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: 12,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: "#4d5f4a"
          }}
        >
          Testnet-only scaffold
        </p>
        <h1 style={{ marginBottom: "0.75rem", fontSize: "clamp(2.5rem, 6vw, 4.5rem)" }}>
          Campus assets, modeled as XLS-20 NFTs.
        </h1>
        <p style={{ maxWidth: 680, fontSize: "1.1rem", lineHeight: 1.6 }}>
          This initial web app is wired for a pnpm workspace with shared XRPL and schema packages.
          The first MVP workflow targets textbooks, with Crossmark as the first wallet adapter and
          Supabase used only after metadata integrity checks against XRPL state.
        </p>
        <ul style={{ margin: "2rem 0 0", paddingLeft: "1.25rem", lineHeight: 1.8 }}>
          {checklist.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}
