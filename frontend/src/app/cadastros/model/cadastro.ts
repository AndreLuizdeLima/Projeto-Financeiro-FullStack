import { readJson } from "@/lib/http";

export type Modo = "criar" | "consultar" | "editar";
export type FormularioProps<T, C, U> = {
  registro?: T;
  modo: Modo;
  ocupado: boolean;
  salvar: (payload: C | U) => Promise<boolean>;
};
export type Registro = { id: number; isActive: boolean };
export type Pagina<T> = {
  data: T[];
  meta: { page: number; total: number; hasNextPage: boolean };
};
export type Request = (path: string, init?: RequestInit) => Promise<Response>;
export type CadastroApi<T, C, U> = {
  listar: (
    request: Request,
    page: number,
    signal: AbortSignal,
  ) => Promise<Pagina<T>>;
  consultar: (request: Request, id: number, signal: AbortSignal) => Promise<T>;
  criar: (request: Request, payload: C) => Promise<T>;
  atualizar: (request: Request, id: number, payload: U) => Promise<T>;
  inativar: (request: Request, id: number) => Promise<T>;
};

export const criarCadastroApi = <T extends Registro, C, U>(
  path: string,
): CadastroApi<T, C, U> => {
  const enviar = async (
    request: Request,
    url: string,
    method: string,
    payload?: C | U,
  ) =>
    readJson<T>(
      await request(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: payload === undefined ? undefined : JSON.stringify(payload),
      }),
    );
  return {
    listar: async (request, page, signal) =>
      readJson<Pagina<T>>(
        await request(`${path}?page=${page}&limit=20`, { signal }),
      ),
    consultar: async (request, id, signal) =>
      readJson<T>(await request(`${path}/${id}`, { signal })),
    criar: (request, payload) => enviar(request, path, "POST", payload),
    atualizar: (request, id, payload) =>
      enviar(request, `${path}/${id}`, "PATCH", payload),
    inativar: (request, id) => enviar(request, `${path}/${id}`, "DELETE"),
  };
};
