import { apiPost } from "@/services/api";
import { setAccessToken } from "@/lib/auth-store";

export type LoginResponse = { access_token: string; token_type: "bearer" };
export type AuthRole = "candidate" | "recruiter" | "admin" | string;

type AuthPayload = {
  username: string;
  password: string;
  fullName?: string;
  rememberMe?: boolean;
  role?: AuthRole;
};

function generateMockToken(
  username: string,
  role: AuthRole = "candidate",
  fullName?: string,
) {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = btoa(
    JSON.stringify({
      sub: username,
      role,
      fullName,
      email: `${username}@example.com`,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 86400,
    }),
  );
  const signature = btoa("mock-signature");

  return `${header}.${payload}.${signature}`;
}

async function mockDelay() {
  await new Promise((resolve) => setTimeout(resolve, 500));
}

export async function signIn({ username, password }: AuthPayload) {
  await mockDelay();

  if (!username || !password) {
    throw new Error("Please enter email and password");
  }

  const token = generateMockToken(username);
  setAccessToken(token);
  return { accessToken: token };
}

export async function signUp({
  username,
  password,
  fullName,
  role = "candidate",
}: AuthPayload) {
  await mockDelay();

  if (!username || !password) {
    throw new Error("Please enter username and password");
  }

  const token = generateMockToken(username, role, fullName);
  setAccessToken(token);
  return { accessToken: token };
}

export function signInWithBackend(username: string, password: string) {
  return apiPost<LoginResponse>(
    "/login",
    { username, password },
    { includeCredentials: true },
  );
}

export function signUpWithBackend(
  username: string,
  password: string,
  role: AuthRole,
) {
  return apiPost<{ ok: boolean }>("/signup", { username, password, role });
}
