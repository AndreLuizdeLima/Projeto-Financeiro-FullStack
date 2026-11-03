import dayjs from "dayjs";
import { readJson } from "@/lib/http";
import type { Request, Pagina } from "@/app/cadastros/model/cadastro";
import type { Conta, TipoConta } from "./contas";

export type ReferenciaConta = { id: number; label: string; isActive: boolean };
type Cliente = {
  id: number;
  razaoSocial: string;
  cnpj: string;
  isActive: boolean;
};
type Plano = {
  id: number;
  codigo: string;
  nome: string;
  natureza: string;
  isActive: boolean;
};
type Centro = { id: number; nome: string; isActive: boolean };
export type DadosConta = {
  tipo: TipoConta;
  descricao: string;
  valorOriginal: string;
  dataEmissao: string;
  dataVencimento: string;
  clienteId: number;
  planoDeContaId: number;
  centroDeCustoId: number | null;
  taxaJurosDiaria: string;
  taxaMulta: string;
};
export type DetalheConta = Conta &
  DadosConta & {
    cliente: Cliente;
    planoDeConta: Plano;
    centroDeCusto: Centro | null;
  };
export type ReferenciasConta = {
  clientes: ReferenciaConta[];
  planos: ReferenciaConta[];
  centros: ReferenciaConta[];
};
export type ValoresConta = Omit<
  DadosConta,
  "tipo" | "clienteId" | "planoDeContaId" | "centroDeCustoId"
> & {
  clienteId: number | null;
  planoDeContaId: number | null;
  centroDeCustoId: number | null;
};
export type ErrosConta = Partial<Record<keyof ValoresConta, string>>;

const clienteOpcao = (c: Cliente): ReferenciaConta => ({
  ...c,
  label: `${c.razaoSocial} · ${c.cnpj}`,
});
const planoOpcao = (p: Plano): ReferenciaConta => ({
  ...p,
  label: `${p.codigo} · ${p.nome}`,
});
const centroOpcao = (c: Centro): ReferenciaConta => ({ ...c, label: c.nome });
const todasPaginas = async <T>(
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
export const carregarReferenciasConta = async (
  request: Request,
  signal: AbortSignal,
): Promise<ReferenciasConta> => {
  const [clientes, planos, centros] = await Promise.all([
    todasPaginas<Cliente>(request, "/cliente", signal),
    todasPaginas<Plano>(request, "/plano-de-contas", signal),
    todasPaginas<Centro>(request, "/centro-de-custo", signal),
  ]);
  return {
    clientes: clientes.filter((c) => c.isActive).map(clienteOpcao),
    planos: planos
      .filter((p) => p.isActive && p.natureza === "ANALITICA")
      .map(planoOpcao),
    centros: centros.filter((c) => c.isActive).map(centroOpcao),
  };
};
export const consultarConta = async (
  request: Request,
  id: number,
  signal: AbortSignal,
) => readJson<DetalheConta>(await request(`/contas/${id}`, { signal }));
export const salvarConta = async (
  request: Request,
  payload: Partial<DadosConta>,
  id?: number,
) =>
  readJson<DetalheConta>(
    await request(id === undefined ? "/contas" : `/contas/${id}`, {
      method: id === undefined ? "POST" : "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }),
  );

export const valoresIniciaisConta = (conta?: DetalheConta): ValoresConta => ({
  descricao: conta?.descricao ?? "",
  valorOriginal: conta?.valorOriginal.replace(".", ",") ?? "",
  dataEmissao: conta?.dataEmissao ?? dayjs().format("YYYY-MM-DD"),
  dataVencimento: conta?.dataVencimento ?? dayjs().format("YYYY-MM-DD"),
  clienteId: conta?.clienteId ?? null,
  planoDeContaId: conta?.planoDeContaId ?? null,
  centroDeCustoId: conta?.centroDeCustoId ?? null,
  taxaJurosDiaria: conta
    ? conta.taxaJurosDiaria
        .replace(/(\.\d*?)0+$/, "$1")
        .replace(/\.$/, "")
        .replace(".", ",")
    : "0",
  taxaMulta: conta
    ? conta.taxaMulta
        .replace(/(\.\d*?)0+$/, "$1")
        .replace(/\.$/, "")
        .replace(".", ",")
    : "0",
});

export const decimalConta = (
  valor: string,
  inteiros: number,
  casas: number,
): string | undefined => {
  const texto = valor.trim();
  if (!/^(?:\d+|\d{1,3}(?:\.\d{3})+)(?:,\d+)?$/.test(texto)) return;
  const [parteInteira, fracao = ""] = texto.replaceAll(".", "").split(",");
  const inteira = parteInteira.replace(/^0+(?=\d)/, "");
  if (inteira.length > inteiros || fracao.length > casas) return;
  const decimal = fracao.replace(/0+$/, "");
  return decimal ? `${inteira}.${decimal}` : inteira;
};
const dataValida = (valor: string) =>
  /^\d{4}-\d{2}-\d{2}$/.test(valor) &&
  dayjs(valor).isValid() &&
  dayjs(valor).format("YYYY-MM-DD") === valor;
export const validarConta = (
  v: ValoresConta,
  refs: ReferenciasConta,
  original?: DetalheConta,
): ErrosConta => {
  const erros: ErrosConta = {};
  if (!v.descricao.trim() || v.descricao.trim().length > 255)
    erros.descricao = "Informe uma descrição com até 255 caracteres.";
  const valor = decimalConta(v.valorOriginal, 17, 2);
  if (valor === undefined || valor === "0")
    erros.valorOriginal =
      "Informe um valor positivo, com até 17 dígitos inteiros e 2 casas decimais.";
  if (!dataValida(v.dataEmissao))
    erros.dataEmissao = "Informe uma data de emissão válida.";
  if (!dataValida(v.dataVencimento))
    erros.dataVencimento = "Informe uma data de vencimento válida.";
  for (const campo of ["taxaJurosDiaria", "taxaMulta"] as const) {
    if (decimalConta(v[campo], 3, 3) === undefined)
      erros[campo] =
        "Informe um percentual entre 0 e 999,999, com até 3 casas decimais.";
  }
  for (const [campo, opcoes] of [
    ["clienteId", refs.clientes],
    ["planoDeContaId", refs.planos],
    ["centroDeCustoId", refs.centros],
  ] as const) {
    const id = v[campo];
    if (id === null && campo === "centroDeCustoId") continue;
    if (id !== null && id === original?.[campo]) continue;
    if (!opcoes.some((opcao) => opcao.id === id && opcao.isActive))
      erros[campo] = "Selecione um cadastro ativo.";
  }
  return erros;
};
export const payloadConta = (
  v: ValoresConta,
  tipo: TipoConta,
  original?: DetalheConta,
): Partial<DadosConta> => {
  const dados: DadosConta = {
    ...v,
    tipo,
    descricao: v.descricao.trim(),
    clienteId: v.clienteId!,
    planoDeContaId: v.planoDeContaId!,
    valorOriginal: decimalConta(v.valorOriginal, 17, 2)!,
    taxaJurosDiaria: decimalConta(v.taxaJurosDiaria, 3, 6)!,
    taxaMulta: decimalConta(v.taxaMulta, 3, 6)!,
  };
  if (!original) return dados;
  const anterior = payloadConta(valoresIniciaisConta(original), original.tipo);
  return Object.fromEntries(
    Object.entries(dados).filter(
      ([campo, valor]) =>
        campo !== "tipo" && valor !== anterior[campo as keyof DadosConta],
    ),
  );
};
export const opcoesContaAtual = (
  refs: ReferenciasConta,
  conta?: DetalheConta,
): ReferenciasConta => {
  const incluir = (
    opcoes: ReferenciaConta[],
    atual?: ReferenciaConta,
  ): ReferenciaConta[] =>
    atual && !opcoes.some((o) => o.id === atual.id)
      ? [
          {
            ...atual,
            isActive: false,
            label: `${atual.label} (indisponível para novos lançamentos)`,
          },
          ...opcoes,
        ]
      : opcoes;
  return {
    clientes: incluir(
      refs.clientes,
      conta?.cliente && clienteOpcao(conta.cliente),
    ),
    planos: incluir(
      refs.planos,
      conta?.planoDeConta && planoOpcao(conta.planoDeConta),
    ),
    centros: incluir(
      refs.centros,
      conta?.centroDeCusto ? centroOpcao(conta.centroDeCusto) : undefined,
    ),
  };
};
