import "server-only";

import { canAccessMarketplaceRoutes } from "./access";
import { createSupabaseServerAuthClient } from "../supabase/auth-server";

type AuthProfileUser = {
  id: string;
  email: string;
};

type ProfileClient = {
  from: (table: "profiles") => {
    upsert: (
      values: {
        id: string;
        email: string;
        display_name: string;
        role: "student";
      },
      options: { onConflict: string }
    ) => PromiseLike<{ error: { message: string } | null }>;
  };
};

export async function ensureAuthProfile(user: AuthProfileUser, client?: ProfileClient) {
  if (!canAccessMarketplaceRoutes(user.email)) {
    return;
  }

  const supabase = client ?? (await createSupabaseServerAuthClient());
  const payload = {
    id: user.id,
    email: user.email.toLowerCase(),
    display_name: user.email.split("@")[0],
    role: "student" as const
  };

  const { error } = await supabase.from("profiles").upsert(payload, {
    onConflict: "id"
  });

  if (error) {
    throw new Error(`Failed to create or update profile: ${error.message}`);
  }
}
