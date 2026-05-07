import Link from "next/link";

import { CreateListingForm } from "./CreateListingForm";

export const runtime = "nodejs";

export default function NewListingPage() {
  return (
    <main style={{ maxWidth: 960, margin: "0 auto", padding: "3rem 1.5rem 4rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
        <div>
          <p style={{ margin: 0, textTransform: "uppercase", letterSpacing: "0.16em", fontSize: 12 }}>
            Marketplace listing
          </p>
          <h1 style={{ marginBottom: "0.5rem", fontSize: "clamp(2rem, 5vw, 3.25rem)" }}>Create listing</h1>
          <p style={{ maxWidth: 720, lineHeight: 1.6 }}>
            Start with the marketplace record, not the wallet flow. This creates a mock-tokenized
            listing tied to your verified school-email account so other users can request it
            immediately. XRPL minting remains optional and separate from this procedure.
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
          <Link href="/marketplace" style={{ color: "#17331d" }}>
            Marketplace
          </Link>
          <Link href="/catalog" style={{ color: "#17331d" }}>
            XRPL Demo
          </Link>
        </div>
      </div>

      <section
        style={{
          marginTop: "2rem",
          padding: "1.5rem",
          borderRadius: 24,
          border: "1px solid #ebebeb",
          background: "#ffffff"
        }}
      >
        <div style={{ marginBottom: "1.25rem", display: "grid", gap: "0.4rem", color: "#4f4f4f" }}>
          <p style={{ margin: 0 }}><strong>Step 1:</strong> create the listing and publish it.</p>
          <p style={{ margin: 0 }}><strong>Step 2:</strong> wait for another verified user to request it.</p>
          <p style={{ margin: 0 }}><strong>Step 3:</strong> accept the request, confirm the handoff, then complete the ownership update.</p>
        </div>
        <p
          style={{
            margin: "0 0 1.25rem",
            padding: "0.9rem 1rem",
            borderRadius: 14,
            background: "#fff8ea",
            color: "#6a4c00",
            lineHeight: 1.6
          }}
        >
          Do not list restricted, unsafe, illegal, perishable, non-transferable, or institutionally
          controlled items. Food, meal swipes, alcohol, drugs, weapons, and official campus
          benefits are not allowed.
        </p>
        <CreateListingForm />
      </section>
    </main>
  );
}
