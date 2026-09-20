export function readAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  const explicit = window.localStorage.getItem('moveshopify.authToken');
  if (explicit) return explicit;

  for (let i = 0; i < window.localStorage.length; i++) {
    const key = window.localStorage.key(i);
    if (!key?.startsWith('sb-') || !key.endsWith('-auth-token')) continue;
    const raw = window.localStorage.getItem(key);
    if (!raw) continue;
    try {
      const parsed = JSON.parse(raw) as {
        access_token?: string;
        currentSession?: { access_token?: string };
      };
      const token = parsed.access_token ?? parsed.currentSession?.access_token;
      if (token) return token;
    } catch {
      // Ignore unrelated localStorage entries.
    }
  }
  return null;
}

export function authHeaders(): HeadersInit | null {
  const token = readAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : null;
}
