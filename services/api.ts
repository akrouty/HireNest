export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";

type ApiError = {
  detail?: string | { msg?: string }[];
};

async function parseError(res: Response) {
  let data: ApiError | null = null;

  try {
    data = await res.json();
  } catch {
    // Some API failures do not include a JSON body.
  }

  if (typeof data?.detail === "string") {
    return data.detail;
  }

  if (Array.isArray(data?.detail)) {
    return data.detail[0]?.msg ?? "Request failed";
  }

  return "Request failed";
}

export async function apiRequest<TResponse>(
  path: string,
  init: RequestInit = {},
): Promise<TResponse> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
    ...init,
  });

  if (!res.ok) {
    throw new Error(await parseError(res));
  }

  const text = await res.text();
  return (text ? JSON.parse(text) : {}) as TResponse;
}

export function apiPost<TResponse>(
  path: string,
  body: unknown,
  opts?: { includeCredentials?: boolean },
) {
  return apiRequest<TResponse>(path, {
    method: "POST",
    body: JSON.stringify(body),
    credentials: opts?.includeCredentials ? "include" : "same-origin",
  });
}
