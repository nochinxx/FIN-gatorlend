"use client";

import { useState } from "react";
import type { CSSProperties } from "react";

import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type SignOutButtonProps = {
  className?: string;
  style?: CSSProperties;
};

export function SignOutButton({ style }: SignOutButtonProps) {
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function handleSignOut() {
    setIsSigningOut(true);

    try {
      const supabase = createSupabaseBrowserClient();
      await supabase.auth.signOut();
    } finally {
      window.location.assign("/login");
    }
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={isSigningOut}
      style={style}
    >
      {isSigningOut ? "Signing Out..." : "Sign Out"}
    </button>
  );
}
