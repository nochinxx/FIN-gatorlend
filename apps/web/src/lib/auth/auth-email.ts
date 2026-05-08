import { getAuthCallbackUrl } from "../site-url";

type AuthEmailClient = {
  signUp: (input: {
    email: string;
    password: string;
    options: {
      emailRedirectTo: string;
    };
  }) => Promise<{ error: { message: string } | null }>;
  resetPasswordForEmail: (email: string, options: {
    redirectTo: string;
  }) => Promise<{ error: { message: string } | null }>;
};

export function getAuthEmailErrorMessage(
  error: { message?: string | null; status?: number | null } | null | undefined,
  fallbackMessage: string
): string {
  const normalizedMessage = error?.message?.toLowerCase() ?? "";

  if (
    normalizedMessage.includes("too many") ||
    normalizedMessage.includes("rate limit") ||
    normalizedMessage.includes("over_email_send_rate_limit")
  ) {
    return "Too many email requests. Please wait before trying again.";
  }

  return fallbackMessage;
}

export async function sendSignupVerificationEmail(
  authClient: AuthEmailClient,
  email: string,
  password: string
) {
  const redirectUrl = getAuthCallbackUrl("/profile/setup");

  if (process.env.NODE_ENV !== "production") {
    console.log("Auth redirect URL:", redirectUrl);
  }

  return authClient.signUp({
    email,
    password,
    options: {
      emailRedirectTo: redirectUrl
    }
  });
}

export async function sendPasswordResetEmail(authClient: AuthEmailClient, email: string) {
  const redirectUrl = getAuthCallbackUrl("/auth/reset-password");

  if (process.env.NODE_ENV !== "production") {
    console.log("Auth redirect URL:", redirectUrl);
  }

  return authClient.resetPasswordForEmail(email, {
    redirectTo: redirectUrl
  });
}
