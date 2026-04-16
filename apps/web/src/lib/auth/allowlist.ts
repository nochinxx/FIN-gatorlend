const DEMO_ALLOWED_EMAILS = [
  "mariojillesca@gmail.com",
  "eruiz19@sfsu.edu",
  "jordonez@sfsu.edu",
  "jcalderon15@sfsu.edu",
  "kcastillojimenez@sfsu.edu",
  "kestrella@sfsu.edu",
  "oferrufino@sfsu.edu",
  "mjimenezillesca@sfsu.edu",
  "wsharifi@sfsu.edu",
  "sraoufi2@sfsu.edu",
  "lle12@sfsu.edu",
  "tfeldman@sfsu.edu",
  "nbran@sfsu.edu"
];

export function isEmailAllowedForDemo(email: string | null | undefined): boolean {
  if (!email) {
    return false;
  }

  return DEMO_ALLOWED_EMAILS.includes(email.trim().toLowerCase());
}

export function getDemoAllowedEmails(): string[] {
  return [...DEMO_ALLOWED_EMAILS];
}
