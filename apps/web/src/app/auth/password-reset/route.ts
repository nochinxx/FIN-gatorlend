import { NextResponse } from "next/server";

import { canStartAuthFlow } from "@/lib/auth/access";
import {
  getAuthEmailErrorMessage,
  sendPasswordResetEmail
} from "@/lib/auth/auth-email";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    email?: string;
  };

  const email = body.email?.trim().toLowerCase() ?? "";

  if (!canStartAuthFlow(email)) {
    return NextResponse.json(
      {
        error: "Unable to send password reset email. Please try again in a few minutes."
      },
      { status: 400 }
    );
  }

  const supabase = createSupabaseServerClient();
  const { error } = await sendPasswordResetEmail(supabase.auth, email);

  if (error) {
    return NextResponse.json(
      {
        error: getAuthEmailErrorMessage(
          error,
          "Unable to send password reset email. Please try again in a few minutes."
        )
      },
      { status: 400 }
    );
  }

  return NextResponse.json({ ok: true });
}
