import {
  clearAccessToken,
  setAccessToken,
  toAuthUser,
  type AuthUser,
} from "@/lib/auth-store";
import { apiGet, apiPost } from "@/services/api";

export type AuthRole = "candidate" | "admin";

export type LoginPayload = {
  email: string;
  password: string;
  rememberMe?: boolean;
};

export type GoogleLoginPayload = {
  credential: string;
  rememberMe?: boolean;
};

export type SignupPayload = {
  email: string;
  password: string;
  fullName: string;
  role?: AuthRole;
};

type LoginResponse = {
  access_token: string;
  token_type: "bearer";
};

type MeResponse = {
  id?: number;
  email: string;
  first_name?: string | null;
  last_name?: string | null;
  full_name?: string | null;
  username?: string | null;
  role: AuthRole;
};

function splitFullName(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  return {
    first_name: parts[0] ?? "Candidate",
    last_name: parts.slice(1).join(" ") || "User",
  };
}

export async function getCurrentUser(): Promise<AuthUser> {
  const me = await apiGet<MeResponse>("/me");
  return toAuthUser(me);
}

export async function signIn({ email, password, rememberMe }: LoginPayload) {
  const response = await apiPost<LoginResponse>(
    "/login",
    { email, password },
    { auth: false },
  );
  setAccessToken(response.access_token, Boolean(rememberMe));
  return getCurrentUser();
}

export async function signInWithGoogle({
  credential,
  rememberMe,
}: GoogleLoginPayload) {
  const response = await apiPost<LoginResponse>(
    "/auth/google",
    { credential },
    { auth: false },
  );
  setAccessToken(response.access_token, Boolean(rememberMe));
  return getCurrentUser();
}

export async function signUp({
  email,
  password,
  fullName,
  role = "candidate",
}: SignupPayload) {
  await apiPost(
    "/signup",
    {
      ...splitFullName(fullName),
      email,
      password,
      role,
    },
    { auth: false },
  );
  return signIn({ email, password, rememberMe: true });
}

export async function logout() {
  try {
    await apiPost("/logout");
  } finally {
    clearAccessToken();
  }
}
