import { Suspense } from "react";

import { ConfirmAuthClient } from "./ConfirmAuthClient";

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
          <section
            style={{
              width: "100%",
              maxWidth: 520,
              padding: "2rem",
              borderRadius: 24,
              background: "#ffffff",
              border: "1px solid #ebebeb",
              boxShadow: "0 10px 40px rgba(17, 17, 17, 0.05)",
              textAlign: "center"
            }}
          >
            <h1 style={{ margin: 0, fontSize: "clamp(1.8rem, 4vw, 2.4rem)" }}>Finishing sign-in</h1>
            <p style={{ margin: "0.9rem 0 0", lineHeight: 1.6, color: "#4f4f4f" }}>
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
