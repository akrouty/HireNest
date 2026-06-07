import { clearAccessToken, getAccessToken, setAccessToken } from "@/lib/auth-store";

export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  process.env.VITE_API_BASE_URL ??
  "http://127.0.0.1:8000";

type ApiErrorBody = {
  detail?: string | { msg?: string }[];
  message?: string;
};

type ApiRequestOptions = RequestInit & {
  auth?: boolean;
  retry?: boolean;
  cacheTtlMs?: number;
  dedupe?: boolean;
};

type CacheEntry = {
  expiresAt: number;
  value: unknown;
};

const getCache = new Map<string, CacheEntry>();
const inFlightGetRequests = new Map<string, Promise<unknown>>();

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public body?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export class NetworkError extends Error {
  constructor(message = "Live service is unavailable") {
    super(message);
    this.name = "NetworkError";
  }
}

function emitClientEvent(name: "api:offline" | "api:online" | "auth:expired") {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(name));
  }
}

async function parseError(res: Response) {
  let data: ApiErrorBody | null = null;

  try {
    data = await res.json();
  } catch {
    // Empty or non-JSON errors are normalized below.
  }

  if (typeof data?.detail === "string") return { message: data.detail, data };
  if (Array.isArray(data?.detail)) {
    return { message: data.detail[0]?.msg ?? "Request failed", data };
  }
  if (data?.message) return { message: data.message, data };

  return { message: res.statusText || "Request failed", data };
}

function mergeHeaders(init: ApiRequestOptions) {
  const headers = new Headers(init.headers);
  const token = getAccessToken();
  const isFormData =
    typeof FormData !== "undefined" && init.body instanceof FormData;

  headers.set("Accept", "application/json");
  if (!isFormData && init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (init.auth !== false && token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return headers;
}

async function refreshAccessToken() {
  const res = await fetch(`${API_BASE}/refresh`, {
    method: "POST",
    credentials: "include",
    headers: { Accept: "application/json" },
  });

  if (!res.ok) return false;
  const data = (await res.json()) as { access_token?: string };
  if (!data.access_token) return false;
  setAccessToken(data.access_token, true);
  return true;
}

export async function apiRequest<TResponse>(
  path: string,
  init: ApiRequestOptions = {},
): Promise<TResponse> {
  const {
    retry = true,
    auth: _auth,
    cacheTtlMs,
    dedupe = true,
    ...requestInit
  } = init;
  const method = (requestInit.method ?? "GET").toUpperCase();
  const cacheKey = method === "GET" ? `${path}|auth:${init.auth !== false}` : "";

  if (method === "GET" && cacheTtlMs && cacheTtlMs > 0) {
    const cached = getCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.value as TResponse;
    }
  }

  if (method === "GET" && dedupe) {
    const pending = inFlightGetRequests.get(cacheKey);
    if (pending) return pending as Promise<TResponse>;
  }

  const requestPromise = performApiRequest<TResponse>(path, init, requestInit, retry).then((value) => {
    if (method === "GET" && cacheTtlMs && cacheTtlMs > 0) {
      getCache.set(cacheKey, { value, expiresAt: Date.now() + cacheTtlMs });
    }
    return value;
  }).finally(() => {
    if (method === "GET") inFlightGetRequests.delete(cacheKey);
  });

  if (method === "GET" && dedupe) {
    inFlightGetRequests.set(cacheKey, requestPromise);
  }

  return requestPromise;
}

async function performApiRequest<TResponse>(
  path: string,
  init: ApiRequestOptions,
  requestInit: RequestInit,
  retry: boolean,
): Promise<TResponse> {

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      ...requestInit,
      credentials: requestInit.credentials ?? "include",
      headers: mergeHeaders(init),
    });
    emitClientEvent("api:online");
  } catch {
    emitClientEvent("api:offline");
    throw new NetworkError();
  }

  if (res.status === 401 && retry && init.auth !== false) {
    const refreshed = await refreshAccessToken().catch(() => false);
    if (refreshed) {
      return apiRequest<TResponse>(path, { ...init, retry: false });
    }
    clearAccessToken();
    emitClientEvent("auth:expired");
  }

  if (!res.ok) {
    const parsed = await parseError(res);
    throw new ApiError(parsed.message, res.status, parsed.data);
  }

  if (res.status === 204) return {} as TResponse;

  const text = await res.text();
  return (text ? JSON.parse(text) : {}) as TResponse;
}

export function invalidateApiCache(prefix?: string) {
  if (!prefix) {
    getCache.clear();
    return;
  }
  for (const key of getCache.keys()) {
    if (key.startsWith(prefix)) getCache.delete(key);
  }
}

export function apiGet<TResponse>(path: string, init?: ApiRequestOptions) {
  return apiRequest<TResponse>(path, { ...init, method: "GET" });
}

export function apiPost<TResponse>(
  path: string,
  body?: unknown,
  init: ApiRequestOptions = {},
) {
  return apiRequest<TResponse>(path, {
    ...init,
    method: "POST",
    body:
      body instanceof FormData || typeof body === "string"
        ? body
        : body === undefined
          ? undefined
          : JSON.stringify(body),
  });
}

export function apiPut<TResponse>(
  path: string,
  body?: unknown,
  init: ApiRequestOptions = {},
) {
  return apiRequest<TResponse>(path, {
    ...init,
    method: "PUT",
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

export function apiDelete<TResponse>(path: string, init: ApiRequestOptions = {}) {
  return apiRequest<TResponse>(path, { ...init, method: "DELETE" });
}

export async function apiHealth() {
  return apiGet<{ ok: boolean; status: string }>("/health", { auth: false });
}
