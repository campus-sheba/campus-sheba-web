import type { ApiRequestOptions } from "./types";

const appendUniversityQuery = (url: string, universityId?: string) => {
  if (!universityId) return url;
  const target = new URL(url, typeof window !== "undefined" ? window.location.origin : "http://localhost");
  if (!target.searchParams.has("university")) {
    target.searchParams.set("university", universityId);
  }
  if (url.startsWith("http")) return target.toString();
  return `${target.pathname}${target.search}${target.hash}`;
};

export async function getClient<T = unknown>(
  url: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const finalUrl = appendUniversityQuery(url, options.universityId);
  const response = await fetch(finalUrl, {
    method: "GET",
    headers: {
      Accept: "application/json",
      ...(options.headers ?? {}),
    },
    cache: options.cache ?? "no-store",
  });

  if (!response.ok) {
    throw new Error(`Request failed (${response.status})`);
  }

  return (await response.json()) as T;
}
