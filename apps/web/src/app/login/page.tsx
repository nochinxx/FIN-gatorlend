import { redirect } from "next/navigation";

import { BrandLogo } from "@/components/BrandLogo";
import { canAccessProtectedAppRoutes } from "@/lib/auth/access";
import { getCurrentUserProfile } from "@/lib/auth/profile";
import { profileNeedsSetup } from "@/lib/auth/profile-schema";
import { createSupabaseServerAuthClient } from "@/lib/supabase/auth-server";

import { LoginForm } from "./LoginForm";

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
    next?: string;
    notice?: string;
  }>;
};

function sanitizeNextPath(nextPath: string | undefined): string {
  if (!nextPath || !nextPath.startsWith("/")) {
    return "/marketplace";
  }

  return nextPath;
}

function getMessageFromParams(error: string | undefined, notice: string | undefined) {
  if (error === "not-authorized") {
    return "Use a verified @sfsu.edu email or approved tester account to access GatorLend.";
  }

  if (error === "email-not-verified") {
    return "Please verify your email before accessing GatorLend.";
  }

  if (error === "profile-setup-failed") {
    return "Your sign-in succeeded, but profile setup could not be completed. Try again.";
  }

  if (error === "magic-link-expired") {
    return "That verification or recovery link has expired. Request a new one and use the latest email only once.";
  }

  if (error === "auth-exchange-failed") {
    return "The Supabase auth callback could not be completed. Request a fresh email and try again.";
  }

  if (notice === "password-updated") {
    return "Your password has been updated. Log in with the new password.";
  }

  return null;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const resolvedSearchParams = await searchParams;
  const nextPath = sanitizeNextPath(resolvedSearchParams.next);
  const supabase = await createSupabaseServerAuthClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (canAccessProtectedAppRoutes(user)) {
    const profile = await getCurrentUserProfile();

    if (profileNeedsSetup(profile)) {
      redirect("/profile/setup");
    }

    redirect(nextPath);
  }

  const message = getMessageFromParams(resolvedSearchParams.error, resolvedSearchParams.notice);

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
          maxWidth: 620,
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
        <h1 style={{ margin: "0 0 0.5rem", fontSize: "clamp(2rem, 5vw, 3rem)", textAlign: "center" }}>
          Sign up or log in with your school email
        </h1>
        <p style={{ lineHeight: 1.6, textAlign: "center", color: "#4f4f4f" }}>
          Access is limited to verified `@sfsu.edu` users, with separate tester accounts available
          for development. GatorLend is independent and not endorsed by SFSU or CSU.
        </p>

        {message ? (
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
            {message}
          </p>
        ) : null}

        <LoginForm nextPath={nextPath} />
      </section>
    </main>
  );
}
