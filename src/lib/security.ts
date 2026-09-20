const FORMULA_PREFIX_RE = /^[=+\-@\t\r]/;
const BLOCKED_PAIRED_TAG_RE =
  /<\s*(script|style|iframe|object|embed|form|button|textarea|select|option)\b[^>]*>[\s\S]*?<\/\s*\1\s*>/gi;
const BLOCKED_TAG_RE =
  /<\/?\s*(script|style|iframe|object|embed|link|meta|base|form|input|button|textarea|select|option)\b[^>]*>/gi;
const EVENT_HANDLER_RE = /\s+on[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi;
const DANGEROUS_URL_ATTR_RE =
  /\s+(href|src|xlink:href|formaction)\s*=\s*(['"]?)\s*(javascript:|vbscript:|data:text\/html)[^'"\s>]*\2/gi;
const DANGEROUS_ATTR_RE = /\s+(style|srcdoc)\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi;

export function stripControlChars(value: string): string {
  return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "");
}

export function escapeCsvFormula(value: string): string {
  const clean = stripControlChars(value);
  return FORMULA_PREFIX_RE.test(clean) ? `'${clean}` : clean;
}

export function sanitizeText(value: string | null | undefined): string {
  return escapeCsvFormula(String(value ?? ""));
}

export function sanitizeNullableText(value: string | null | undefined): string | null {
  const clean = sanitizeText(value);
  return clean === "" ? null : clean;
}

export function sanitizeHtml(value: string | null | undefined): string {
  return escapeCsvFormula(
    stripControlChars(String(value ?? ""))
      .replace(BLOCKED_PAIRED_TAG_RE, "")
      .replace(BLOCKED_TAG_RE, "")
      .replace(EVENT_HANDLER_RE, "")
      .replace(DANGEROUS_URL_ATTR_RE, ' $1="#"')
      .replace(DANGEROUS_ATTR_RE, ""),
  );
}

export function sanitizeEmail(value: string | null | undefined): string {
  return stripControlChars(String(value ?? "")).trim().toLowerCase();
}

export function isAllowedShopifyImageUrl(value: string | null | undefined): boolean {
  if (!value) return false;
  try {
    const url = new URL(value);
    const hostname = url.hostname.toLowerCase();
    return (
      url.protocol === "https:" &&
      (hostname === "cdn.shopify.com" ||
        hostname.endsWith(".shopifycdn.net") ||
        hostname.endsWith(".myshopify.com"))
    );
  } catch {
    return false;
  }
}
