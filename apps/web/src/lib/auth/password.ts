export const MIN_PASSWORD_LENGTH = 8;

export function validatePassword(password: string | null | undefined): string {
  const normalizedPassword = password ?? "";

  if (!normalizedPassword) {
    throw new Error("Password is required.");
  }

  if (normalizedPassword.length < MIN_PASSWORD_LENGTH) {
    throw new Error(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
  }

  return normalizedPassword;
}
