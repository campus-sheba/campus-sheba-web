/**
 * Hosts that break next/image optimization in some dev setups (e.g. TLS / placeholder domains).
 */
export function shouldUnoptimizeRemoteImage(src: string | null | undefined): boolean {
  if (!src) return true;
  if (src.startsWith("/")) return false;
  try {
    const u = new URL(src);
    if (u.protocol === "http:") return true;
    if (u.hostname === "example.com") return true;
    return false;
  } catch {
    return true;
  }
}
