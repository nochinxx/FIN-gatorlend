import "server-only";

import {
  canAccessProtectedAppRoutes,
  getEmailLocalPart,
  isSfsuEmail,
  type EmailVerificationLike
} from "./access";
import {
  assertMarketplaceProfileReady,
  buildDefaultDisplayName,
  normalizeProfileEmail,
  profileSchema,
  profileNeedsSetup,
  type Profile
} from "./profile-schema";
import { mapProfileWriteError } from "./profile-errors";
import { validateUsername } from "./username";
import { createSupabaseServerAuthClient } from "../supabase/auth-server";

type AuthProfileUser = EmailVerificationLike & {
  id: string;
  email: string;
};

type ProfileUpdateInput = {
  username?: string | null;
  display_name?: string | null;
  wallet_address?: string | null;
  major?: string | null;
  student_type?: string | null;
  bio?: string | null;
};

type ProfileClient = any;

const PROFILE_SELECT_COLUMNS =
  "id, email, username, display_name, role, wallet_address, major, student_type, bio, created_at, updated_at";
const PROFILE_LEGACY_SELECT_COLUMNS =
  "id, email, display_name, role, wallet_address, created_at, updated_at";

function parseProfile(data: unknown): Profile {
  return profileSchema.parse(data);
}

function isMissingProfileColumnError(error: { message?: string | null } | null | undefined): boolean {
  return Boolean(error?.message && /column profiles\.(username|major|student_type|bio) does not exist/i.test(error.message));
}

async function selectProfileRow(
  supabase: ProfileClient,
  mode: "single" | "maybeSingle",
  filters: (query: any) => any
): Promise<{ data: unknown; error: any }> {
  const runSelect = async (columns: string) => {
    const query = filters(supabase.from("profiles").select(columns));
    return mode === "single" ? query.single() : query.maybeSingle();
  };

  const primaryResult = await runSelect(PROFILE_SELECT_COLUMNS);

  if (!isMissingProfileColumnError(primaryResult.error)) {
    return primaryResult;
  }

  const legacyResult = await runSelect(PROFILE_LEGACY_SELECT_COLUMNS);

  if (legacyResult.error) {
    return legacyResult;
  }

  if (!legacyResult.data) {
    return legacyResult;
  }

  return {
    data: {
      ...legacyResult.data,
      username: null,
      major: null,
      student_type: null,
      bio: null
    },
    error: null
  };
}

async function selectProfileRows(
  supabase: ProfileClient,
  filters: (query: any) => any
): Promise<{ data: unknown[] | null; error: any }> {
  const runSelect = async (columns: string) => {
    const query = filters(supabase.from("profiles").select(columns));
    return query.order("created_at", { ascending: true });
  };

  const primaryResult = await runSelect(PROFILE_SELECT_COLUMNS);

  if (!isMissingProfileColumnError(primaryResult.error)) {
    return primaryResult;
  }

  const legacyResult = await runSelect(PROFILE_LEGACY_SELECT_COLUMNS);

  if (legacyResult.error || !legacyResult.data) {
    return legacyResult;
  }

  return {
    data: legacyResult.data.map((row: any) => ({
      ...row,
      username: null,
      major: null,
      student_type: null,
      bio: null
    })),
    error: null
  };
}

function toNullableText(value: string | null | undefined): string | null {
  const trimmedValue = value?.trim();
  return trimmedValue ? trimmedValue : null;
}

function buildBootstrapProfile(user: AuthProfileUser) {
  return {
    id: user.id,
    email: normalizeProfileEmail(user.email),
    display_name: buildDefaultDisplayName(user.email),
    role: "student" as const
  };
}

export async function requireVerifiedSfsuUser(client?: ProfileClient): Promise<AuthProfileUser> {
  const supabase = client ?? (await createSupabaseServerAuthClient());
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user?.email || !canAccessProtectedAppRoutes(user)) {
    throw new Error("Please log in with a verified @sfsu.edu email before continuing.");
  }

  return {
    id: user.id,
    email: normalizeProfileEmail(user.email),
    email_confirmed_at: user.email_confirmed_at ?? user.confirmed_at ?? null,
    confirmed_at: user.confirmed_at ?? user.email_confirmed_at ?? null
  };
}

export async function ensureAuthProfile(user: AuthProfileUser, client?: ProfileClient): Promise<Profile> {
  if (!isSfsuEmail(user.email)) {
    throw new Error("Profile bootstrap requires an @sfsu.edu email.");
  }

  const supabase = client ?? (await createSupabaseServerAuthClient());
  const payload = buildBootstrapProfile(user);

  const upsertResult = await supabase.from("profiles").upsert(payload, {
    onConflict: "id"
  });

  const upsertError = "error" in upsertResult ? upsertResult.error : null;

  if (upsertError) {
    throw new Error(`Failed to create or update profile: ${upsertError.message}`);
  }

  const { data, error } = await selectProfileRow(supabase, "single", (query) => query.eq("id", user.id));

  if (error) {
    throw new Error(`Failed to create or update profile: ${error.message}`);
  }

  return parseProfile(data);
}

export async function getProfileById(id: string, client?: ProfileClient): Promise<Profile | null> {
  const supabase = client ?? (await createSupabaseServerAuthClient());
  const { data, error } = await selectProfileRow(supabase, "maybeSingle", (query) => query.eq("id", id));

  if (error) {
    throw new Error(`Failed to load profile: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  return parseProfile(data);
}

export async function listProfilesByIds(ids: string[], client?: ProfileClient): Promise<Profile[]> {
  if (ids.length === 0) {
    return [];
  }

  const supabase = client ?? (await createSupabaseServerAuthClient());
  const { data, error } = await selectProfileRows(supabase, (query) => query.in("id", ids));

  if (error) {
    throw new Error(`Failed to load profiles: ${error.message}`);
  }

  return (data ?? []).map((row: unknown) => parseProfile(row));
}

export async function getCurrentUserProfile(client?: ProfileClient): Promise<Profile> {
  const currentUser = await requireVerifiedSfsuUser(client);
  const profile = await ensureAuthProfile(currentUser, client ?? (await createSupabaseServerAuthClient()));
  return profile;
}

export async function getCurrentMarketplaceActor(client?: ProfileClient): Promise<{
  user: AuthProfileUser;
  profile: Profile;
}> {
  const user = await requireVerifiedSfsuUser(client);
  const profile = await ensureAuthProfile(user, client ?? (await createSupabaseServerAuthClient()));
  assertMarketplaceProfileReady(profile);
  return {
    user,
    profile
  };
}

export async function saveCurrentUserProfile(
  input: ProfileUpdateInput,
  client?: ProfileClient
): Promise<Profile> {
  const supabase = client ?? (await createSupabaseServerAuthClient());
  const currentUser = await requireVerifiedSfsuUser(supabase);
  const existingProfile = await ensureAuthProfile(currentUser, supabase);
  const normalizedUsername =
    input.username === undefined || input.username === null ? existingProfile.username ?? null : validateUsername(input.username);

  const payload = {
    id: currentUser.id,
    email: normalizeProfileEmail(currentUser.email),
    username: normalizedUsername,
    display_name:
      input.display_name === undefined
        ? existingProfile.display_name ?? buildDefaultDisplayName(currentUser.email)
        : toNullableText(input.display_name),
    role: existingProfile.role ?? "student",
    wallet_address: toNullableText(input.wallet_address) ?? null,
    major: toNullableText(input.major) ?? null,
    student_type: toNullableText(input.student_type) ?? null,
    bio: toNullableText(input.bio) ?? null
  };

  const { data, error } = await supabase
    .from("profiles")
    .update(payload)
    .eq("id", currentUser.id)
    .select(PROFILE_SELECT_COLUMNS)
    .single();

  if (error) {
    throw mapProfileWriteError(error);
  }

  return parseProfile(data);
}

export async function requireCompletedProfile(client?: ProfileClient): Promise<Profile> {
  const profile = await getCurrentUserProfile(client);
  assertMarketplaceProfileReady(profile);
  return profile;
}

export function isProfileSetupComplete(profile: Pick<Profile, "username"> | null | undefined): boolean {
  return !profileNeedsSetup(profile);
}

export function getProfileEmailPrefix(profile: Pick<Profile, "email">): string {
  return getEmailLocalPart(profile.email);
}
