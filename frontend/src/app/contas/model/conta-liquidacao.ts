import { readJson } from "@/lib/http";
import type { Pagina, Request } from "@/app/cadastros/model/cadastro";
import type { TipoConta } from "./contas";

export type PreviaLiquidacao = {
  conta: {
    id: number;
    tipo: TipoConta;
    descricao: string;
    clienteNome: string;
    dataEmissao: string;
    dataVencimento: string;
  };
  dataAtual: string;
  dataPagamento: string;
  valorOriginal: string;
  taxaJurosDiaria: string;
  taxaMulta: string;
  diasAtraso: number;
  juros: string;
  multa: string;
  valorTotal: string;
};
export type OpcaoLiquidacao = { id: number; label: string; isActive: boolean };
export type OpcoesLiquidacao = {
  bancos: OpcaoLiquidacao[];
  formas: OpcaoLiquidacao[];
};
export type LiquidarConta = {
  dataPagamento: string;
  contaBancariaId: number;
  formaRecebimentoId: number;
  valorTotalEsperado: string;
};
export type ResultadoLiquidacao = {
  conta: { id: number; situacao: "LIQUIDADA" };
  liquidacao: { valorTotal: string };
};

const listarOpcoes = async <T>(
  request: Request,
  path: string,
  signal: AbortSignal,
) => {
  const itens: T[] = [];
  for (let page = 1; ; page++) {
    const pagina = await readJson<Pagina<T>>(
      await request(`${path}?page=${page}&limit=100`, { signal }),
    );
    itens.push(...pagina.data);
    if (!pagina.meta.hasNextPage) return itens;
  }
};
export const carregarOpcoesLiquidacao = async (
  request: Request,
  signal: AbortSignal,
): Promise<OpcoesLiquidacao> => {
  const [bancos, formas] = await Promise.all([
    listarOpcoes<{
      id: number;
      nome: string;
      conta: string;
      isActive: boolean;
    }>(request, "/conta-bancaria", signal),
    listarOpcoes<{ id: number; nome: string; isActive: boolean }>(
      request,
      "/formas-recebimento",
      signal,
    ),
  ]);
  return {
    bancos: bancos
      .filter((b) => b.isActive)
      .map((b) => ({
        id: b.id,
        isActive: b.isActive,
        label: `${b.nome} · ${b.conta}`,
      })),
    formas: formas
      .filter((f) => f.isActive)
      .map((f) => ({ id: f.id, isActive: f.isActive, label: f.nome })),
  };
};
export const consultarPreviaLiquidacao = async (
  request: Request,
  id: number,
  signal: AbortSignal,
  dataPagamento?: string,
) => {
  const query = dataPagamento
    ? `?${new URLSearchParams({ dataPagamento })}`
    : "";
  return readJson<PreviaLiquidacao>(
    await request(`/contas/${id}/previa-liquidacao${query}`, { signal }),
  );
};
export const liquidarConta = async (
  request: Request,
  id: number,
  payload: LiquidarConta,
) =>
  readJson<ResultadoLiquidacao>(
    await request(`/contas/${id}/liquidar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }),
  );
