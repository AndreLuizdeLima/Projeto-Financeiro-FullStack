import { apiUrl, readJson } from "@/lib/http";

export type AuthTokens = { accessToken: string; refreshToken: string };
export type AuthState = {
  tokens: AuthTokens | null;
  status: "restoring" | "authenticated" | "unauthenticated";
};

const storageKey = "fluxo.auth";
function loadTokens(): AuthTokens | null {
  try {
    const tokens = JSON.parse(localStorage.getItem(storageKey) || "null");
    if (
      typeof tokens?.accessToken === "string" &&
      tokens.accessToken &&
      typeof tokens?.refreshToken === "string" &&
      tokens.refreshToken
    )
      return {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      };
    localStorage.removeItem(storageKey);
  } catch {
    /* Invalid or unavailable storage starts without a session. */
  }
  return null;
}

const stored = loadTokens();
let state: AuthState = {
  tokens: stored,
  status: stored ? "restoring" : "unauthenticated",
};
let generation = 0;
let refreshTask: { generation: number; promise: Promise<string> } | null = null;
let restoreTask: Promise<void> | null = null;
const listeners = new Set<() => void>();

function publish(tokens: AuthTokens | null, status: AuthState["status"]) {
  try {
    if (tokens) localStorage.setItem(storageKey, JSON.stringify(tokens));
    else localStorage.removeItem(storageKey);
  } catch {
    /* Session remains available in memory when storage is unavailable. */
  }
  state = { tokens, status };
  listeners.forEach((listener) => listener());
}

function logout() {
  generation++;
  publish(null, "unauthenticated");
}

function refresh(): Promise<string> {
  const currentGeneration = generation;
  if (refreshTask?.generation === currentGeneration) return refreshTask.promise;
  const tokens = state.tokens;
  if (!tokens) return Promise.reject(new Error("Sessão encerrada."));
  const promise = (async () => {
    try {
      const response = await fetch(apiUrl("/auth/refresh"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: tokens.refreshToken }),
      });
      const data = await readJson<{ accessToken: string }>(response);
      if (typeof data.accessToken !== "string" || !data.accessToken)
        throw new Error("Resposta inválida do servidor.");
      if (generation !== currentGeneration) throw new Error("Sessão alterada.");
      publish({ ...tokens, accessToken: data.accessToken }, "authenticated");
      return data.accessToken;
    } catch (error) {
      if (generation === currentGeneration) logout();
      throw error;
    } finally {
      if (refreshTask?.generation === currentGeneration) refreshTask = null;
    }
  })();
  refreshTask = { generation: currentGeneration, promise };
  return promise;
}

async function request(path: string, init?: RequestInit): Promise<Response> {
  if (/^\/?auth\/(login|refresh)\/?(?:\?|$)/.test(path))
    return fetch(apiUrl(path), init);
  const currentGeneration = generation;
  const token = state.tokens?.accessToken;
  if (!token) throw new Error("Sessão encerrada.");
  // Keep an unused template so request bodies can be sent again once.
  const template = new Request(apiUrl(path), init);
  const send = (accessToken: string) => {
    const copy = template.clone();
    const headers = new Headers(copy.headers);
    headers.set("Authorization", `Bearer ${accessToken}`);
    return fetch(new Request(copy, { headers }));
  };
  const response = await send(token);
  if (generation !== currentGeneration) throw new Error("Sessão alterada.");
  if (response.status !== 401) return response;
  const nextToken =
    state.tokens?.accessToken !== token
      ? state.tokens?.accessToken
      : await refresh();
  if (!nextToken || generation !== currentGeneration)
    throw new Error("Sessão encerrada.");
  const retried = await send(nextToken);
  if (generation !== currentGeneration) throw new Error("Sessão alterada.");
  if (retried.status === 401) logout();
  return retried;
}

export const authSession = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  getSnapshot: () => state,
  getGeneration: () => generation,
  login(tokens: AuthTokens, expectedGeneration: number) {
    if (generation !== expectedGeneration) return false;
    generation++;
    publish(tokens, "authenticated");
    return true;
  },
  logout,
  request,
  restore() {
    if (!restoreTask && state.status === "restoring")
      restoreTask = refresh().then(
        () => {},
        () => {},
      );
    return restoreTask;
  },
};
