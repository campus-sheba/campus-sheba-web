/**
 * Normalises refresh-token API payloads: `{ data: { accessToken, refreshToken } }`
 * or nested `{ data: { data: { ... } } }`.
 */
export function parseRefreshTokens(json: unknown): { accessToken: string; refreshToken: string } | null {
  if (!json || typeof json !== "object") return null;
  const root = json as Record<string, unknown>;
  const data = root.data;
  if (!data || typeof data !== "object" || Array.isArray(data)) return null;

  const layer = data as Record<string, unknown>;
  if (typeof layer.accessToken === "string" && typeof layer.refreshToken === "string") {
    return { accessToken: layer.accessToken, refreshToken: layer.refreshToken };
  }

  const inner = layer.data;
  if (inner && typeof inner === "object" && !Array.isArray(inner)) {
    const i = inner as Record<string, unknown>;
    if (typeof i.accessToken === "string" && typeof i.refreshToken === "string") {
      return { accessToken: i.accessToken, refreshToken: i.refreshToken };
    }
  }

  return null;
}
