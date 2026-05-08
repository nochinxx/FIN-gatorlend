import { redirect } from "next/navigation";

import { getCurrentUserProfile } from "@/lib/auth/profile";
import { profileNeedsSetup } from "@/lib/auth/profile-schema";

import { ProfileForm } from "./ProfileForm";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function ProfilePage() {
  const profile = await getCurrentUserProfile();

  if (profileNeedsSetup(profile)) {
    redirect("/profile/setup");
  }

  return (
    <main style={{ maxWidth: 760, margin: "0 auto", padding: "3rem 1.5rem 4rem" }}>
      <div style={{ display: "grid", gap: "0.75rem" }}>
        <p style={{ margin: 0, textTransform: "uppercase", letterSpacing: "0.16em", fontSize: 12 }}>
          Profile
        </p>
        <h1 style={{ margin: 0, fontSize: "clamp(2rem, 5vw, 3rem)" }}>Manage your profile</h1>
        <p style={{ margin: 0, color: "#4f4f4f", lineHeight: 1.6 }}>
          Your marketplace ownership records stay tied to your account ID, so updating your username
          does not break listing history.
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
        <ProfileForm
          email={profile.email}
          username={profile.username ?? ""}
          displayName={profile.display_name ?? ""}
          major={profile.major ?? ""}
          studentType={profile.student_type ?? ""}
          bio={profile.bio ?? ""}
          walletAddress={profile.wallet_address ?? ""}
        />
      </section>
    </main>
  );
}
