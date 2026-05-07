import { isEmailAllowedForDemo } from "./allowlist";

export function isSfsuEmail(email: string | null | undefined): boolean {
  if (!email) {
    return false;
  }

  const normalizedEmail = email.trim().toLowerCase();

  return /^[^@\s]+@sfsu\.edu$/.test(normalizedEmail);
}

export function canAccessMarketplaceRoutes(email: string | null | undefined): boolean {
  return isSfsuEmail(email);
}

export function canStartAuthFlow(email: string | null | undefined): boolean {
  return canAccessProtectedAppRoutes(email);
}

export function canAccessProtectedAppRoutes(email: string | null | undefined): boolean {
  return canAccessMarketplaceRoutes(email) || isEmailAllowedForDemo(email);
}
