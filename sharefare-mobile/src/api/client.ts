import { Platform } from "react-native";

export function getApiBaseUrl() {
  const fromEnv = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();
  if (fromEnv) return fromEnv;

  // Defaults:
  // - Android emulator reaches host machine via 10.0.2.2
  // - iOS simulator can use localhost
  return Platform.OS === "android" ? "http://10.0.2.2:8080" : "http://localhost:8080";
}

export async function apiFetch(path: string, opts: RequestInit & { token?: string | null } = {}) {
  const url = `${getApiBaseUrl()}${path}`;
  const headers = new Headers(opts.headers ?? {});
  headers.set("Accept", "application/json");
  if (!headers.has("Content-Type") && opts.body) headers.set("Content-Type", "application/json");
  if (opts.token) headers.set("Authorization", `Bearer ${opts.token}`);

  const res = await fetch(url, { ...opts, headers });
  const text = await res.text();
  const json = text ? safeJson(text) : null;

  if (!res.ok) {
    const message =
      (json && typeof (json as any).message === "string" && (json as any).message) ||
      (typeof json === "string" ? json : null) ||
      `Request failed (${res.status})`;
    throw new Error(message);
  }
  return json;
}

function safeJson(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

