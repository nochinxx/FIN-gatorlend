import { NextResponse, type NextRequest } from "next/server";

import { createSupabaseServerAuthClient } from "@/lib/supabase/auth-server";

export async function GET(request: NextRequest) {
  const supabase = await createSupabaseServerAuthClient();

  await supabase.auth.signOut();

  return NextResponse.redirect(new URL("/login", request.url));
}
