import { jwtDecode } from "jwt-decode";

const TOKEN_KEY = "access_token";

type JwtPayload = {
  sub?: string;
  role?: string;
  email?: string;
  fullName?: string;
};

export type AuthUser = {
  username: string;
  fullName: string;
  email?: string | null;
  role?: string | null;
  initials: string;
};

const MOCK_USER: AuthUser = {
  username: "sana",
  fullName: "Sana Layouni",
  email: "sana@hirenest.com",
  role: "candidate",
  initials: "SL",
};

function toTitleName(value: string) {
  return value
    .replace(/[-_.]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(" ");
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "HN";
  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function setAccessToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getAccessToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function clearAccessToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function getUserFromToken(): AuthUser | null {
  const token = getAccessToken();
  if (!token) return null;

  try {
    const payload = jwtDecode<JwtPayload>(token);
    if (!payload?.sub) return null;
    const fullName = payload.fullName ?? toTitleName(payload.sub);

    return {
      username: payload.sub,
      fullName,
      email: payload.email ?? null,
      role: payload.role ?? null,
      initials: getInitials(fullName),
    };
  } catch {
    return null;
  }
}

export function getSafeUser(): AuthUser {
  return getUserFromToken() ?? MOCK_USER;
}
