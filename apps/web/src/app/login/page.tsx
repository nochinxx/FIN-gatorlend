import { redirect } from "next/navigation";
import Image from "next/image";

import { BrandLogo } from "@/components/BrandLogo";
import { canAccessProtectedAppRoutes } from "@/lib/auth/access";
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

  if (canAccessProtectedAppRoutes(user?.email)) {
    redirect(nextPath);
  }

  const notAuthorized = resolvedSearchParams.error === "not-authorized";
  const profileSetupFailed = resolvedSearchParams.error === "profile-setup-failed";
  const magicLinkExpired = resolvedSearchParams.error === "magic-link-expired";
  const authExchangeFailed = resolvedSearchParams.error === "auth-exchange-failed";

  return (
    <main
      style={{
        minHeight: "calc(100vh - 73px)",
        display: "grid",
        placeItems: "center",
        padding: "3rem 1.5rem"
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: 520,
          padding: "2rem",
          borderRadius: 24,
          background: "#ffffff",
          border: "1px solid #ebebeb",
          boxShadow: "0 10px 40px rgba(17, 17, 17, 0.05)"
        }}
      >
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "1.5rem" }}>
          <BrandLogo size="login" priority />
        </div>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "0.75rem" }}>
          <Image src="/branding/fin-globe-black.png" alt="FIN globe" width={22} height={22} />
        </div>
        <p
          style={{
            margin: 0,
            textTransform: "uppercase",
            letterSpacing: "0.16em",
            fontSize: 12,
            textAlign: "center",
            color: "#666666"
          }}
        >
          Demo access
        </p>
        <h1 style={{ margin: "0.75rem 0 0.5rem", fontSize: "clamp(2rem, 5vw, 3rem)", textAlign: "center" }}>
          Sign in for the protected demo routes
        </h1>
        <p style={{ lineHeight: 1.6, textAlign: "center", color: "#4f4f4f" }}>
          Use an `@sfsu.edu` email to receive a Supabase magic link. Protected pages are blocked
          server-side until the session is valid and the user is allowed into the marketplace.
        </p>

        {notAuthorized ? (
          <p
            style={{
              margin: "1rem 0",
              padding: "0.85rem 1rem",
              borderRadius: 12,
              background: "#ffe7de",
              color: "#7f2413",
              fontWeight: 600,
              textAlign: "center"
            }}
          >
            Not authorized for demo.
          </p>
        ) : null}

        {profileSetupFailed ? (
          <p
            style={{
              margin: "1rem 0",
              padding: "0.85rem 1rem",
              borderRadius: 12,
              background: "#fff3ef",
              color: "#7f2413",
              fontWeight: 600,
              textAlign: "center"
            }}
          >
            Sign-in succeeded, but profile setup failed. Apply
            {" "}`supabase/migrations/0004_fix_profile_bootstrap_rls.sql`{" "}
            in your Supabase project, then try again.
          </p>
        ) : null}

        {magicLinkExpired ? (
          <p
            style={{
              margin: "1rem 0",
              padding: "0.85rem 1rem",
              borderRadius: 12,
              background: "#fff3ef",
              color: "#7f2413",
              fontWeight: 600,
              textAlign: "center"
            }}
          >
            That magic link has expired or is invalid. Request a new one and use the most recent email only once.
          </p>
        ) : null}

        {authExchangeFailed ? (
          <p
            style={{
              margin: "1rem 0",
              padding: "0.85rem 1rem",
              borderRadius: 12,
              background: "#fff3ef",
              color: "#7f2413",
              fontWeight: 600,
              textAlign: "center"
            }}
          >
            Magic-link sign-in could not be completed. Request a fresh link and try again.
          </p>
        ) : null}

        <LoginForm nextPath={nextPath} />
      </section>
    </main>
  );
}
