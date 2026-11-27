import dayjs from "dayjs";
import { readJson } from "@/lib/http";
import type { Request, Pagina } from "@/app/cadastros/model/cadastro";
import type { ContaBancaria } from "@/app/contas-bancarias/model/contas-bancarias";

export const tipos = {
  ENTRADA: "Entrada",
  SAIDA: "Saída",
  TRANSFERENCIA: "Transferência",
};
export const origens = {
  AVULSA: "Avulsa",
  SALDO_INICIAL: "Saldo inicial",
  LIQUIDACAO: "Liquidação",
  ESTORNO: "Estorno",
};
export type TipoMovimento = keyof typeof tipos;
export type OrigemMovimento = keyof typeof origens;
export type Movimento = {
  id: number;
  tipo: TipoMovimento;
  origem: OrigemMovimento;
  descricao: string;
  valor: string;
  data: string;
  contaOrigemId: number | null;
  contaDestinoId: number | null;
  liquidacaoId: number | null;
  clienteId: number | null;
  planoDeContaId: number | null;
  centroDeCustoId: number | null;
  formaRecebimentoId: number | null;
  estornoDeId: number | null;
  criadoPorId: number;
  criadoEm: string;
  liquidacao?: { contaId: number; conta?: { descricao: string } } | null;
  estornoDe?: Movimento | null;
};
export type GrupoResumo = {
  tipo: TipoMovimento;
  origem: OrigemMovimento;
  quantidade: number;
  valorTotal: string;
};
export type Filtros = {
  tipo: "" | TipoMovimento;
  origem: "" | OrigemMovimento;
  contaBancariaId: number | null;
  dataInicial: string;
  dataFinal: string;
};
export const filtrosIniciais = (): Filtros => ({
  tipo: "",
  origem: "",
  contaBancariaId: null,
  dataInicial: dayjs().startOf("month").format("YYYY-MM-DD"),
  dataFinal: dayjs().endOf("month").format("YYYY-MM-DD"),
});
export const validarPeriodo = (f: Filtros) =>
  !f.dataInicial || !f.dataFinal
    ? "Selecione o início e o fim do período."
    : f.dataInicial > f.dataFinal
      ? "A data inicial deve ser anterior ou igual à final."
      : undefined;
export const parametros = (filtros: Filtros) => {
  const params = new URLSearchParams();
  Object.entries(filtros).forEach(([campo, valor]) => {
    if (valor !== "" && valor !== null) params.set(campo, String(valor));
  });
  return params;
};
export const listar = (
  request: Request,
  filtros: Filtros,
  page: number,
  signal: AbortSignal,
) => {
  const params = parametros(filtros);
  params.set("page", String(page));
  params.set("limit", "20");
  return request(`/movimentacoes?${params}`, { signal }).then(
    readJson<Pagina<Movimento>>,
  );
};
export const resumir = (
  request: Request,
  filtros: Filtros,
  signal: AbortSignal,
) =>
  request(`/movimentacoes/resumo?${parametros(filtros)}`, { signal }).then(
    readJson<GrupoResumo[]>,
  );
export const consultar = (request: Request, id: number, signal: AbortSignal) =>
  request(`/movimentacoes/${id}`, { signal }).then(readJson<Movimento>);
export const carregarBancos = async (request: Request, signal: AbortSignal) => {
  const bancos: ContaBancaria[] = [];
  for (let page = 1; ; page++) {
    const pagina = await readJson<Pagina<ContaBancaria>>(
      await request(`/conta-bancaria?page=${page}&limit=100`, { signal }),
    );
    bancos.push(...pagina.data);
    if (!pagina.meta.hasNextPage) return bancos;
  }
};
export const centavos = (valor: string) => {
  const [inteiro, decimal = ""] = valor.split(".");
  return BigInt(inteiro) * 100n + BigInt(decimal.padEnd(2, "0"));
};
export const moedaCentavos = (valor: bigint) =>
  `${(valor / 100n).toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })},${(valor % 100n).toString().padStart(2, "0")}`;
export const moeda = (valor: string) => moedaCentavos(centavos(valor));
export const totaisResumo = (grupos: GrupoResumo[]) =>
  grupos.reduce(
    (total, grupo) => {
      total[grupo.tipo] += centavos(grupo.valorTotal);
      return total;
    },
    { ENTRADA: 0n, SAIDA: 0n, TRANSFERENCIA: 0n },
  );
export const dataFormatada = (data: string) =>
  data.split("-").reverse().join("/");
