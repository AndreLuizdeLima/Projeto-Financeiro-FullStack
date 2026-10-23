import type { AuthTokens } from "@/auth/session";
import { apiUrl, readJson } from "@/lib/http";

export type LoginInput = { email: string; password: string };

export async function login(input: LoginInput): Promise<AuthTokens> {
  const response = await fetch(apiUrl("/auth/login"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const tokens = await readJson<AuthTokens>(response);
  if (
    !tokens.accessToken ||
    typeof tokens.accessToken !== "string" ||
    !tokens.refreshToken ||
    typeof tokens.refreshToken !== "string"
  )
    throw new Error("Resposta inválida do servidor.");
  return tokens;
}
