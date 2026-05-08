import { z } from "zod";

import { getEmailLocalPart, normalizeEmail } from "./access";

export const PROFILE_SETUP_REQUIRED_MESSAGE =
  "Please finish setting up your profile before using the marketplace.";

export const profileSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  username: z.string().nullable().optional(),
  display_name: z.string().nullable().optional(),
  role: z.string(),
  wallet_address: z.string().nullable().optional(),
  major: z.string().nullable().optional(),
  student_type: z.string().nullable().optional(),
  bio: z.string().nullable().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional()
});

export type Profile = z.infer<typeof profileSchema>;

export type ProfileIdentity = Pick<Profile, "username" | "display_name" | "email">;

export function buildDefaultDisplayName(email: string): string {
  return getEmailLocalPart(email);
}

export function profileNeedsSetup(profile: Pick<Profile, "username"> | null | undefined): boolean {
  return !profile?.username;
}

export function assertMarketplaceProfileReady(profile: Pick<Profile, "username"> | null | undefined) {
  if (!profile || profileNeedsSetup(profile)) {
    throw new Error(PROFILE_SETUP_REQUIRED_MESSAGE);
  }
}

export function getProfileIdentityLabel(profile: ProfileIdentity | null | undefined): string {
  if (!profile) {
    return "verified school-email user";
  }

  if (profile.username?.trim()) {
    return profile.username.trim();
  }

  if (profile.display_name?.trim()) {
    return profile.display_name.trim();
  }

  return getEmailLocalPart(profile.email);
}

export function normalizeProfileEmail(email: string): string {
  return normalizeEmail(email);
}
