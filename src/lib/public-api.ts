const LIVE_API_URL = "https://skil-bridge-server-v2.vercel.app";
const CLIENT_CACHE_TTL = 45 * 1000;

type CachedResponse = {
  expiresAt: number;
  body: string;
  status: number;
  statusText: string;
  headers: [string, string][];
};

const clientCache = new Map<string, CachedResponse>();
const inFlightRequests = new Map<string, Promise<Response>>();

function normalizeBaseUrl(url?: string) {
  return url?.replace(/\/+$/, "");
}

export function getPublicApiBases() {
  const primary = normalizeBaseUrl(process.env.NEXT_PUBLIC_API_URL);
  const fallback = normalizeBaseUrl(
    process.env.NEXT_PUBLIC_FALLBACK_API_URL || LIVE_API_URL,
  );

  return Array.from(new Set([primary, fallback].filter(Boolean))) as string[];
}

export async function fetchPublicApi(path: string, init?: RequestInit) {
  const method = init?.method?.toUpperCase() || "GET";
  const canUseClientCache =
    typeof window !== "undefined" && method === "GET" && !init?.body;
  const cacheKey = canUseClientCache ? path : "";

  if (canUseClientCache) {
    const cached = clientCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return new Response(cached.body, {
        status: cached.status,
        statusText: cached.statusText,
        headers: cached.headers,
      });
    }

    const inFlight = inFlightRequests.get(cacheKey);
    if (inFlight) return (await inFlight).clone();
  }

  let lastError: unknown;

  const request = (async () => {
    for (const baseUrl of getPublicApiBases()) {
      try {
        const res = await fetch(`${baseUrl}${path}`, init);
        if (res.ok || res.status === 404) {
          if (canUseClientCache && res.ok) {
            const clone = res.clone();
            const body = await clone.text();
            clientCache.set(cacheKey, {
              expiresAt: Date.now() + CLIENT_CACHE_TTL,
              body,
              status: res.status,
              statusText: res.statusText,
              headers: Array.from(res.headers.entries()),
            });
            return new Response(body, {
              status: res.status,
              statusText: res.statusText,
              headers: res.headers,
            });
          }

          return res;
        }
        lastError = new Error(`Request failed with status ${res.status}`);
      } catch (error) {
        lastError = error;
      }
    }

    throw lastError instanceof Error
      ? lastError
      : new Error("Failed to connect to API");
  })();

  if (canUseClientCache) {
    inFlightRequests.set(cacheKey, request);
    void request
      .finally(() => inFlightRequests.delete(cacheKey))
      .catch(() => {});
  }

  return request;
}
