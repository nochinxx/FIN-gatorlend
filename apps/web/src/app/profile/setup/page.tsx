import { redirect } from "next/navigation";

import { getCurrentUserProfile } from "@/lib/auth/profile";
import { profileNeedsSetup } from "@/lib/auth/profile-schema";

import { ProfileSetupForm } from "./ProfileSetupForm";

type ProfileSetupPageProps = {
  searchParams: Promise<{
    next?: string;
  }>;
};

function sanitizeNextPath(nextPath: string | undefined): string {
  if (!nextPath || !nextPath.startsWith("/")) {
    return "/marketplace";
  }

  return nextPath;
}

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function ProfileSetupPage({ searchParams }: ProfileSetupPageProps) {
  const resolvedSearchParams = await searchParams;
  const nextPath = sanitizeNextPath(resolvedSearchParams.next);
  const profile = await getCurrentUserProfile();

  if (!profileNeedsSetup(profile)) {
    redirect(nextPath);
  }

  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: "3rem 1.5rem 4rem" }}>
      <div style={{ display: "grid", gap: "0.75rem" }}>
        <p style={{ margin: 0, textTransform: "uppercase", letterSpacing: "0.16em", fontSize: 12 }}>
          Profile setup
        </p>
        <h1 style={{ margin: 0, fontSize: "clamp(2rem, 5vw, 3rem)" }}>Choose your username</h1>
        <p style={{ margin: 0, color: "#4f4f4f", lineHeight: 1.6 }}>
          Before you create, request, or transfer marketplace items, you need a unique public
          username. Wallet connection remains optional and separate from this setup.
        </p>
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
        <ProfileSetupForm
          email={profile.email}
          defaultDisplayName={profile.display_name ?? ""}
          defaultMajor={profile.major ?? ""}
          defaultStudentType={profile.student_type ?? ""}
          nextPath={nextPath}
        />
      </section>
    </main>
  );
}
