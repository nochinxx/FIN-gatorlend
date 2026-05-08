import { NextResponse } from "next/server";

import { canStartAuthFlow } from "@/lib/auth/access";
import {
  getAuthEmailErrorMessage,
  sendSignupVerificationEmail
} from "@/lib/auth/auth-email";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    email?: string;
    password?: string;
  };

  const email = body.email?.trim().toLowerCase() ?? "";
  const password = body.password ?? "";

  if (!canStartAuthFlow(email) || !password) {
    return NextResponse.json(
      {
        error: "Unable to send verification email. Please try again in a few minutes."
      },
      { status: 400 }
    );
  }

  const supabase = createSupabaseServerClient();
  const { error } = await sendSignupVerificationEmail(supabase.auth, email, password);

  if (error) {
    return NextResponse.json(
      {
        error: getAuthEmailErrorMessage(
          error,
          "Unable to send verification email. Please try again in a few minutes."
        )
      },
      { status: 400 }
    );
  }

  return NextResponse.json({ ok: true });
}
