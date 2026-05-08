function normalizeAllowedEmail(email: string | null | undefined): string {
  return email?.trim().toLowerCase() ?? "";
}

export const TESTER_ROLE_BY_EMAIL = {
  "mariojillesca@gmail.com": "owner",
  "mjimenezillesca@sfsu.edu": "admin",
  "eruiz19@sfsu.edu": "student",
  "jordonez@sfsu.edu": "student",
  "jcalderon15@sfsu.edu": "student",
  "kcastillojimenez@sfsu.edu": "student",
  "kestrella@sfsu.edu": "student",
  "oferrufino@sfsu.edu": "student",
  "wsharifi@sfsu.edu": "student",
  "sraoufi2@sfsu.edu": "student",
  "lle12@sfsu.edu": "student",
  "tfeldman@sfsu.edu": "student",
  "nbran@sfsu.edu": "student"
} as const;

export type TesterRole = (typeof TESTER_ROLE_BY_EMAIL)[keyof typeof TESTER_ROLE_BY_EMAIL];

export function isApprovedTesterEmail(email: string | null | undefined): boolean {
  const normalizedEmail = normalizeAllowedEmail(email);
  return normalizedEmail in TESTER_ROLE_BY_EMAIL;
}

export function getApprovedRoleForEmail(email: string | null | undefined): TesterRole | null {
  const normalizedEmail = normalizeAllowedEmail(email);
  return TESTER_ROLE_BY_EMAIL[normalizedEmail as keyof typeof TESTER_ROLE_BY_EMAIL] ?? null;
}

export function getApprovedTesterEmails(): string[] {
  return Object.keys(TESTER_ROLE_BY_EMAIL);
}
