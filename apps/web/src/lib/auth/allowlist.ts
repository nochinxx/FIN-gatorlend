function normalizeAllowedEmail(email: string | null | undefined): string {
  return email?.trim().toLowerCase() ?? "";
}

function parseTesterEmails(): Set<string> {
  const raw = process.env.TESTER_EMAILS ?? "";
  const emails = new Set<string>();

  for (const entry of raw.split(",")) {
    const normalized = normalizeAllowedEmail(entry);
    if (normalized) {
      emails.add(normalized);
    }
  }

  return emails;
}

function getTesterEmails(): Set<string> {
  return parseTesterEmails();
}

export function isApprovedTesterEmail(email: string | null | undefined): boolean {
  return getTesterEmails().has(normalizeAllowedEmail(email));
}

export function getApprovedRoleForEmail(email: string | null | undefined): "owner" | "admin" | "student" | null {
  return isApprovedTesterEmail(email) ? "student" : null;
}
