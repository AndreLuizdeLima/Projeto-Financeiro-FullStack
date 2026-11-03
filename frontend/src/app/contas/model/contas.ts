import { readJson } from "@/lib/http";
import dayjs from "dayjs";

export type TipoConta = "PAGAR" | "RECEBER";
export type SituacaoConta = "ABERTA" | "LIQUIDADA" | "CANCELADA";
export type FiltrosContas = {
  situacao: "" | SituacaoConta;
  dataInicial: string;
  dataFinal: string;
  dataEmissaoInicial: string;
  dataEmissaoFinal: string;
  vencida: "" | "true" | "false";
};
export const criarFiltrosIniciais = (): FiltrosContas => {
  const hoje = dayjs();
  return {
    situacao: "",
    dataInicial: hoje.startOf("month").format("YYYY-MM-DD"),
    dataFinal: hoje.endOf("month").format("YYYY-MM-DD"),
    dataEmissaoInicial: "",
    dataEmissaoFinal: "",
    vencida: "",
  };
};
export type Conta = {
  id: number;
  tipo: TipoConta;
  descricao: string;
  valorOriginal: string;
  dataEmissao: string;
  dataVencimento: string;
  situacao: SituacaoConta;
  vencida: boolean;
  planoDeConta: { id: number; codigo: string; nome: string } | null;
  centroDeCusto: { id: number; nome: string } | null;
};
export type PaginaContas = {
  data: Conta[];
  meta: { page: number; limit: number; total: number; hasNextPage: boolean };
};
type Request = (path: string, init?: RequestInit) => Promise<Response>;

export const parametrosContas = (tipo: TipoConta, filtros: FiltrosContas) => {
  const params = new URLSearchParams({ tipoConta: tipo });
  Object.entries(filtros).forEach(([chave, valor]) => {
    if (valor) params.set(chave, valor);
  });
  return params;
};
export const listarContas = async (
  request: Request,
  tipo: TipoConta,
  filtros: FiltrosContas,
  page: number,
  signal: AbortSignal,
) => {
  const params = parametrosContas(tipo, filtros);
  params.set("page", String(page));
  params.set("limit", "20");
  return readJson<PaginaContas>(await request(`/contas?${params}`, { signal }));
};

const centavos = (valor: string) => {
  const [inteiro, decimal = ""] = valor.split(".");
  return BigInt(inteiro) * 100n + BigInt(decimal.padEnd(2, "0").slice(0, 2));
};
export const formatarCentavos = (valor: bigint) =>
  `${(valor / 100n).toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })},${(valor % 100n).toString().padStart(2, "0")}`;
export const formatarValor = (valor: string) =>
  formatarCentavos(centavos(valor));
export const formatarData = (valor: string) =>
  valor.split("-").reverse().join("/");

export const cancelarConta = async (request: Request, id: number) =>
  readJson<Pick<Conta, "id" | "situacao">>(
    await request(`/contas/${id}/cancelar`, { method: "POST" }),
  );
