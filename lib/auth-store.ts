import { jwtDecode } from "jwt-decode";

const TOKEN_KEY = "access_token";
const SESSION_TOKEN_KEY = "session_access_token";

type JwtPayload = {
  sub?: string;
  role?: string;
  email?: string;
  fullName?: string;
  full_name?: string;
  first_name?: string;
  last_name?: string;
};

export type AuthUser = {
  id?: number;
  username: string;
  fullName: string;
  first_name?: string | null;
  last_name?: string | null;
  full_name?: string | null;
  email?: string | null;
  role?: string | null;
  initials: string;
};

function fallbackDisplayName(firstName?: string | null, lastName?: string | null, fullName?: string | null) {
  return [firstName, lastName].filter(Boolean).join(" ").trim() || fullName || "Candidate";
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "HN";
  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function isBrowser() {
  return typeof window !== "undefined";
}

export function setAccessToken(token: string, persist = false) {
  if (!isBrowser()) return;
  const target = persist ? window.localStorage : window.sessionStorage;
  const other = persist ? window.sessionStorage : window.localStorage;
  target.setItem(persist ? TOKEN_KEY : SESSION_TOKEN_KEY, token);
  other.removeItem(persist ? SESSION_TOKEN_KEY : TOKEN_KEY);
}

export function getAccessToken(): string | null {
  if (!isBrowser()) return null;
  return (
    window.sessionStorage.getItem(SESSION_TOKEN_KEY) ??
    window.localStorage.getItem(TOKEN_KEY)
  );
}

export function clearAccessToken() {
  if (!isBrowser()) return;
  window.sessionStorage.removeItem(SESSION_TOKEN_KEY);
  window.localStorage.removeItem(TOKEN_KEY);
}

export function getUserFromToken(): AuthUser | null {
  const token = getAccessToken();
  if (!token) return null;

  try {
    const payload = jwtDecode<JwtPayload>(token);
    if (!payload?.sub) return null;

    const email = payload.email ?? payload.sub;
    const username = email.split("@", 1)[0];
    const fullName = fallbackDisplayName(payload.first_name, payload.last_name, payload.fullName ?? payload.full_name);

    return {
      username,
      fullName,
      first_name: payload.first_name ?? null,
      last_name: payload.last_name ?? null,
      email,
      role: payload.role ?? null,
      initials: getInitials(fullName),
    };
  } catch {
    return null;
  }
}

export function toAuthUser(data: {
  id?: number;
  email: string;
  role?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  full_name?: string | null;
  username?: string | null;
}): AuthUser {
  const username = data.username ?? data.email.split("@", 1)[0];
  const fullName = fallbackDisplayName(data.first_name, data.last_name, data.full_name);

  return {
    id: data.id,
    username,
    fullName,
    first_name: data.first_name ?? null,
    last_name: data.last_name ?? null,
    full_name: data.full_name ?? null,
    email: data.email,
    role: data.role ?? null,
    initials: getInitials(fullName),
  };
}
