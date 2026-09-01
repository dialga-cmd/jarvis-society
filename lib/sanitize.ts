// Only absolute http(s) URLs may be stored in user-supplied link fields
// (linkedin, github…). Everything else — javascript:, data:, vbscript:, bare
// relative URLs — is rejected to keep malicious schemes out of rendered hrefs.
const ALLOWED = /^https?:\/\//i;

export function safeUrl(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const s = v.trim().replace(/\s+/g, "");
  if (!s) return null;
  return ALLOWED.test(s) ? s : null;
}

// Returns an error message when the value is not a safe URL, or null when ok.
export function badUrl(v: unknown, label: string): string | null {
  if (typeof v !== "string" || !v.trim()) return null;
  return safeUrl(v) ? null : `${label} must be a valid http(s) URL.`;
}