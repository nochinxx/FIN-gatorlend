import { redirect } from "next/navigation";

import { createSupabaseServerAuthClient } from "@/lib/supabase/auth-server";

import { ResetPasswordForm } from "./ResetPasswordForm";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function ResetPasswordPage() {
  const supabase = await createSupabaseServerAuthClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main style={{ maxWidth: 640, margin: "0 auto", padding: "3rem 1.5rem 4rem" }}>
      <div style={{ display: "grid", gap: "0.75rem" }}>
        <p style={{ margin: 0, textTransform: "uppercase", letterSpacing: "0.16em", fontSize: 12 }}>
          Reset password
        </p>
        <h1 style={{ margin: 0, fontSize: "clamp(2rem, 5vw, 3rem)" }}>Set a new password</h1>
        <p style={{ margin: 0, color: "#4f4f4f", lineHeight: 1.6 }}>
          Finish the Supabase recovery flow by choosing a new password for your account.
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
        <ResetPasswordForm />
      </section>
    </main>
  );
}
