import dayjs from "dayjs";
import { readJson } from "@/lib/http";
import type { Request } from "@/app/cadastros/model/cadastro";
import type { ContaBancaria } from "@/app/contas-bancarias/model/contas-bancarias";
import type { Movimento, TipoMovimento } from "./movimentacoes";

export type ValoresLancamento = {
  descricao: string;
  valor: string;
  data: string;
  contaOrigemId: number | null;
  contaDestinoId: number | null;
};
export type ErrosLancamento = Partial<Record<keyof ValoresLancamento, string>>;
export const valoresIniciais = (): ValoresLancamento => ({
  descricao: "",
  valor: "",
  data: dayjs().format("YYYY-MM-DD"),
  contaOrigemId: null,
  contaDestinoId: null,
});
export const valorDecimal = (valor: string) =>
  valor
    .replace(/^R\$\s*/, "")
    .replace(/\./g, "")
    .replace(",", ".");
export const validarLancamento = (
  v: ValoresLancamento,
  bancos: ContaBancaria[],
  hoje: string,
  tipo: TipoMovimento,
): ErrosLancamento => {
  const erros: ErrosLancamento = {};
  if (!v.descricao.trim() || v.descricao.trim().length > 255)
    erros.descricao = "Informe uma descrição de até 255 caracteres.";
  const valor = valorDecimal(v.valor);
  if (!/^(?:0|[1-9]\d{0,16})\.\d{2}$/.test(valor) || /^0\.00$/.test(valor))
    erros.valor = "Informe um valor positivo com até 17 dígitos inteiros.";
  const data = new Date(v.data);
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(v.data) ||
    !Number.isFinite(data.getTime()) ||
    data.toISOString().slice(0, 10) !== v.data
  )
    erros.data = "Informe uma data válida.";
  else if (v.data > hoje)
    erros.data = "A movimentação não pode estar no futuro.";
  if (
    tipo !== "ENTRADA" &&
    !bancos.some((b) => b.id === v.contaOrigemId && b.isActive)
  )
    erros.contaOrigemId = "Selecione uma conta de origem ativa.";
  if (
    tipo !== "SAIDA" &&
    !bancos.some((b) => b.id === v.contaDestinoId && b.isActive)
  )
    erros.contaDestinoId = "Selecione uma conta de destino ativa.";
  else if (tipo === "TRANSFERENCIA" && v.contaOrigemId === v.contaDestinoId)
    erros.contaDestinoId = "A conta de destino deve ser diferente da origem.";
  return erros;
};
export const criarLancamento = async (
  request: Request,
  v: ValoresLancamento,
  tipo: TipoMovimento,
) => readJson<Movimento>(await requestResponse(request, v, tipo));
async function requestResponse(
  request: Request,
  v: ValoresLancamento,
  tipo: TipoMovimento,
): Promise<Response> {
  return request("/movimentacoes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      tipo,
      origem: "AVULSA",
      descricao: v.descricao.trim(),
      valor: valorDecimal(v.valor),
      data: v.data,
      contaOrigemId: tipo === "ENTRADA" ? undefined : v.contaOrigemId,
      contaDestinoId: tipo === "SAIDA" ? undefined : v.contaDestinoId,
    }),
  });
}
