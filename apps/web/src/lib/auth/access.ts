export type EmailVerificationLike = {
  email?: string | null;
  email_confirmed_at?: string | null;
  confirmed_at?: string | null;
};

export function normalizeEmail(email: string | null | undefined): string {
  return email?.trim().toLowerCase() ?? "";
}

export function getEmailLocalPart(email: string | null | undefined): string {
  const normalizedEmail = normalizeEmail(email);
  const [localPart = "student"] = normalizedEmail.split("@");
  return localPart || "student";
}

export function isSfsuEmail(email: string | null | undefined): boolean {
  const normalizedEmail = normalizeEmail(email);
  return /^[^@\s]+@sfsu\.edu$/.test(normalizedEmail);
}

export function isEmailVerified(user: EmailVerificationLike | null | undefined): boolean {
  return Boolean(user?.email_confirmed_at || user?.confirmed_at);
}

export function canStartAuthFlow(email: string | null | undefined): boolean {
  return isSfsuEmail(email);
}

export function canAccessMarketplaceRoutes(user: EmailVerificationLike | null | undefined): boolean {
  return Boolean(user?.email && isSfsuEmail(user.email) && isEmailVerified(user));
}

export function canAccessProtectedAppRoutes(user: EmailVerificationLike | null | undefined): boolean {
  return canAccessMarketplaceRoutes(user);
}
