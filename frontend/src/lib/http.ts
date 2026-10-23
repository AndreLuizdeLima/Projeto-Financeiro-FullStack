const baseUrl = (
  import.meta.env.VITE_API_URL || "http://localhost:3000"
).replace(/\/$/, "");

export const apiUrl = (path: string) => `${baseUrl}/${path.replace(/^\//, "")}`;

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export async function readJson<T>(response: Response): Promise<T> {
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const message =
      typeof body?.message === "string"
        ? body.message
        : "Não foi possível concluir a solicitação.";
    throw new ApiError(response.status, message);
  }
  if (!body) throw new Error("Resposta inválida do servidor.");
  return body as T;
}
