// API helper that ensures credentials are included
export async function api(url: string, options: RequestInit = {}) {
  return fetch(url, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
}

export async function apiGet(url: string) {
  return api(url, { method: "GET" });
}

export async function apiPost(url: string, body: unknown) {
  return api(url, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function apiPatch(url: string, body: unknown) {
  return api(url, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export async function apiDelete(url: string, body?: unknown) {
  return api(url, {
    method: "DELETE",
    body: body ? JSON.stringify(body) : undefined,
  });
}
