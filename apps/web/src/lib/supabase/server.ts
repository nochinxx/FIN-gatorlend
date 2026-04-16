import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { getSupabaseAnonKey, getSupabaseUrl, hasSupabaseConfig } from "./config";

export function hasSupabaseServerConfig(): boolean {
  return hasSupabaseConfig();
}

export function createSupabaseServerClient(): SupabaseClient {
  if (!hasSupabaseServerConfig()) {
    throw new Error(
      "Supabase environment variables are missing. Set SUPABASE_URL/SUPABASE_ANON_KEY or NEXT_PUBLIC_SUPABASE_URL/NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }

  return createClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
}
