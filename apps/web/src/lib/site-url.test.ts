import { afterEach, describe, expect, it } from "vitest";

import { getAuthCallbackUrl, getSiteUrl } from "./site-url";

const originalNextPublicSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;
const originalVercelUrl = process.env.VERCEL_URL;

function resetEnv() {
  if (originalNextPublicSiteUrl === undefined) {
    delete process.env.NEXT_PUBLIC_SITE_URL;
  } else {
    process.env.NEXT_PUBLIC_SITE_URL = originalNextPublicSiteUrl;
  }

  if (originalVercelUrl === undefined) {
    delete process.env.VERCEL_URL;
  } else {
    process.env.VERCEL_URL = originalVercelUrl;
  }
}

describe("getSiteUrl", () => {
  afterEach(() => {
    resetEnv();
  });

  it("returns NEXT_PUBLIC_SITE_URL when present", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://fin-gatorlend.com";
    delete process.env.VERCEL_URL;

    expect(getSiteUrl()).toBe("https://fin-gatorlend.com");
  });

  it("removes a trailing slash from NEXT_PUBLIC_SITE_URL", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://fin-gatorlend.com/";
    delete process.env.VERCEL_URL;

    expect(getSiteUrl()).toBe("https://fin-gatorlend.com");
  });

  it("trims whitespace around NEXT_PUBLIC_SITE_URL", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "  https://fin-gatorlend.com/  ";
    delete process.env.VERCEL_URL;

    expect(getSiteUrl()).toBe("https://fin-gatorlend.com");
  });

  it("uses https VERCEL_URL when NEXT_PUBLIC_SITE_URL is absent", () => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
    process.env.VERCEL_URL = "abc.vercel.app";

    expect(getSiteUrl()).toBe("https://abc.vercel.app");
  });

  it("falls back to localhost when no env is set", () => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
    delete process.env.VERCEL_URL;

    expect(getSiteUrl()).toBe("http://localhost:3000");
  });
});

describe("getAuthCallbackUrl", () => {
  afterEach(() => {
    resetEnv();
  });

  it("defaults to the marketplace callback path", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://fin-gatorlend.com";

    expect(getAuthCallbackUrl()).toBe(
      "https://fin-gatorlend.com/auth/callback?next=%2Fmarketplace"
    );
  });

  it("encodes /profile/setup correctly", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://fin-gatorlend.com";

    expect(getAuthCallbackUrl("/profile/setup")).toBe(
      "https://fin-gatorlend.com/auth/callback?next=%2Fprofile%2Fsetup"
    );
  });

  it("encodes /auth/reset-password correctly", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://fin-gatorlend.com";

    expect(getAuthCallbackUrl("/auth/reset-password")).toBe(
      "https://fin-gatorlend.com/auth/callback?next=%2Fauth%2Freset-password"
    );
  });

  it("defaults invalid next paths to /marketplace", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://fin-gatorlend.com";

    expect(getAuthCallbackUrl("marketplace")).toBe(
      "https://fin-gatorlend.com/auth/callback?next=%2Fmarketplace"
    );
  });
});
