function normalizeBaseUrl(value: string | undefined): string {
  const trimmedValue = value?.trim() ?? "";

  if (!trimmedValue) {
    return "";
  }

  return trimmedValue.replace(/\/+$/, "");
}

function sanitizeNextPath(nextPath: string | undefined): string {
  if (!nextPath || !nextPath.startsWith("/")) {
    return "/marketplace";
  }

  return nextPath;
}

export function getSiteUrl(): string {
  const publicSiteUrl = normalizeBaseUrl(process.env.NEXT_PUBLIC_SITE_URL);

  if (publicSiteUrl) {
    return publicSiteUrl;
  }

  const vercelUrl = normalizeBaseUrl(process.env.VERCEL_URL);

  if (vercelUrl) {
    return `https://${vercelUrl}`;
  }

  return "http://localhost:3000";
}

export function getAuthCallbackUrl(nextPath = "/marketplace"): string {
  const safeNextPath = sanitizeNextPath(nextPath);
  return `${getSiteUrl()}/auth/callback?next=${encodeURIComponent(safeNextPath)}`;
}
