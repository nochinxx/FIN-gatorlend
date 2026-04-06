import Link from "next/link";

import { TextbookForm } from "./TextbookForm";

export default function NewTextbookPage() {
  return (
    <main style={{ maxWidth: 960, margin: "0 auto", padding: "3rem 1.5rem 4rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
        <div>
          <p style={{ margin: 0, textTransform: "uppercase", letterSpacing: "0.16em", fontSize: 12 }}>
            Textbook registration
          </p>
          <h1 style={{ marginBottom: "0.5rem", fontSize: "clamp(2rem, 5vw, 3.25rem)" }}>
            Create a textbook asset record
          </h1>
          <p style={{ maxWidth: 720, lineHeight: 1.6 }}>
            This first vertical slice writes only textbook assets. The payload is validated with the
            shared multi-asset schema before insert, then persisted as `asset_type = "textbook"`
            plus textbook metadata.
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
          <Link href="/" style={{ color: "#17331d" }}>
            Home
          </Link>
          <Link href="/catalog" style={{ color: "#17331d" }}>
            Catalog
          </Link>
        </div>
      </div>
      <section
        style={{
          marginTop: "2rem",
          padding: "1.5rem",
          borderRadius: 24,
          background: "#fffaf0",
          boxShadow: "0 20px 70px rgba(18, 33, 23, 0.08)"
        }}
      >
        <TextbookForm />
      </section>
    </main>
  );
}
