const DEMO_ALLOWED_EMAILS = ["mariojillesca@gmail.com"];

export function isEmailAllowedForDemo(email: string | null | undefined): boolean {
  if (!email) {
    return false;
  }

  return DEMO_ALLOWED_EMAILS.includes(email.trim().toLowerCase());
}

export function getDemoAllowedEmails(): string[] {
  return [...DEMO_ALLOWED_EMAILS];
}
