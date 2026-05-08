import { afterEach, describe, expect, it, vi } from "vitest";

import {
  getAuthEmailErrorMessage,
  sendPasswordResetEmail,
  sendSignupVerificationEmail
} from "./auth-email";

const originalNextPublicSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;

describe("auth email helpers", () => {
  afterEach(() => {
    vi.restoreAllMocks();

    if (originalNextPublicSiteUrl === undefined) {
      delete process.env.NEXT_PUBLIC_SITE_URL;
    } else {
      process.env.NEXT_PUBLIC_SITE_URL = originalNextPublicSiteUrl;
    }
  });

  it("signup uses emailRedirectTo from getAuthCallbackUrl('/profile/setup')", async () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://fin-gatorlend.com";

    const signUp = vi.fn().mockResolvedValue({ error: null });

    await sendSignupVerificationEmail(
      {
        signUp,
        resetPasswordForEmail: vi.fn()
      },
      "student@sfsu.edu",
      "password123"
    );

    expect(signUp).toHaveBeenCalledWith({
      email: "student@sfsu.edu",
      password: "password123",
      options: {
        emailRedirectTo: "https://fin-gatorlend.com/auth/confirm?next=%2Fprofile%2Fsetup"
      }
    });
  });

  it("reset password uses redirectTo from getAuthCallbackUrl('/auth/reset-password')", async () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://fin-gatorlend.com";

    const resetPasswordForEmail = vi.fn().mockResolvedValue({ error: null });

    await sendPasswordResetEmail(
      {
        signUp: vi.fn(),
        resetPasswordForEmail
      },
      "student@sfsu.edu"
    );

    expect(resetPasswordForEmail).toHaveBeenCalledWith("student@sfsu.edu", {
      redirectTo: "https://fin-gatorlend.com/auth/confirm?next=%2Fauth%2Freset-password"
    });
  });

  it("maps rate limit errors to a clean retry message", () => {
    expect(
      getAuthEmailErrorMessage(
        { message: "over_email_send_rate_limit" },
        "Unable to send verification email. Please try again in a few minutes."
      )
    ).toBe("Too many email requests. Please wait before trying again.");
  });
});
