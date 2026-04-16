import { redirect } from "next/navigation";

import { isEmailAllowedForDemo } from "@/lib/auth/allowlist";
import { createSupabaseServerAuthClient } from "@/lib/supabase/auth-server";

import { LoginForm } from "./LoginForm";

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
    next?: string;
  }>;
};

function sanitizeNextPath(nextPath: string | undefined): string {
  if (!nextPath || !nextPath.startsWith("/")) {
    return "/catalog";
  }

  return nextPath;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const resolvedSearchParams = await searchParams;
  const nextPath = sanitizeNextPath(resolvedSearchParams.next);
  const supabase = await createSupabaseServerAuthClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (isEmailAllowedForDemo(user?.email)) {
    redirect(nextPath);
  }

  const notAuthorized = resolvedSearchParams.error === "not-authorized";

  return (
    <main style={{ maxWidth: 640, margin: "0 auto", padding: "5rem 1.5rem" }}>
      <section
        style={{
          padding: "2rem",
          borderRadius: 24,
          background: "#fffaf0",
          boxShadow: "0 20px 70px rgba(18, 33, 23, 0.08)"
        }}
      >
        <p style={{ margin: 0, textTransform: "uppercase", letterSpacing: "0.16em", fontSize: 12 }}>
          Demo access
        </p>
        <h1 style={{ marginBottom: "0.5rem", fontSize: "clamp(2rem, 5vw, 3rem)" }}>
          Sign in for the protected demo routes
        </h1>
        <p style={{ lineHeight: 1.6 }}>
          Use an approved team email to receive a Supabase magic link. Protected pages are blocked
          server-side until the session is valid and the email is allowlisted.
        </p>

        {notAuthorized ? (
          <p
            style={{
              margin: "1rem 0",
              padding: "0.85rem 1rem",
              borderRadius: 12,
              background: "#ffe7de",
              color: "#7f2413",
              fontWeight: 600
            }}
          >
            Not authorized for demo.
          </p>
        ) : null}

        <LoginForm nextPath={nextPath} />
      </section>
    </main>
  );
}
