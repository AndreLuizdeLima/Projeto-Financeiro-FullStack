import { readJson } from "@/lib/http";
import type { Pagina, Request } from "@/app/cadastros/model/cadastro";
export const tipos = {
  ATIVO: "Ativo",
  PASSIVO: "Passivo",
  RECEITA: "Receita",
  DESPESA: "Despesa",
} as const;
export type TipoPlano = keyof typeof tipos;
export type Plano = {
  id: number;
  codigo: string;
  nome: string;
  tipo: TipoPlano;
  natureza: "SINTETICA" | "ANALITICA";
  isActive: boolean;
};
export type CriarPlano = Pick<Plano, "nome" | "tipo"> & {
  natureza: "ANALITICA";
  contaPaiId: number;
};
export type EditarPlano = Partial<Pick<Plano, "nome" | "tipo" | "isActive">>;
export async function carregarPlanos(request: Request, signal: AbortSignal) {
  const itens: Plano[] = [];
  for (let page = 1; ; page++) {
    const pagina = await readJson<Pagina<Plano>>(
      await request(`/plano-de-contas?page=${page}&limit=100`, {
        signal,
      }),
    );
    itens.push(...pagina.data);
    if (!pagina.meta.hasNextPage) return itens;
  }
}
export const consultarPlano = async (
  request: Request,
  id: number,
  signal: AbortSignal,
) =>
  readJson<Plano>(
    await request(`/plano-de-contas/${id}`, {
      signal,
    }),
  );
export const gravarPlano = async (
  request: Request,
  method: "POST" | "PATCH" | "DELETE",
  payload?: CriarPlano | EditarPlano,
  id?: number,
) =>
  readJson<Plano>(
    await request(`/plano-de-contas${id === undefined ? "" : `/${id}`}`, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: payload === undefined ? undefined : JSON.stringify(payload),
    }),
  );
