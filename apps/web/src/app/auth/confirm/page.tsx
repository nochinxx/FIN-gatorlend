import { Suspense } from "react";

import { ConfirmAuthClient } from "./ConfirmAuthClient";

const cardStyle = {
  width: "100%",
  maxWidth: 520,
  padding: "2rem",
  borderRadius: 24,
  background: "#111111",
  border: "1px solid #242424",
  boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
  textAlign: "center" as const
};

export default function AuthConfirmPage() {
  return (
    <main
      style={{
        minHeight: "calc(100vh - 73px)",
        display: "grid",
        placeItems: "center",
        padding: "3rem 1.5rem"
      }}
    >
      <Suspense
        fallback={
          <section style={cardStyle}>
            <h1 style={{ margin: 0, fontSize: "clamp(1.8rem, 4vw, 2.4rem)" }}>Finishing sign-in</h1>
            <p style={{ margin: "0.9rem 0 0", lineHeight: 1.6, color: "#9a9a9a" }}>
              Confirming your email link...
            </p>
          </section>
        }
      >
        <ConfirmAuthClient />
      </Suspense>
    </main>
  );
}
