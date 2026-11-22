import dayjs from "dayjs";
import { readJson } from "@/lib/http";
import type { Request } from "@/app/cadastros/model/cadastro";

export const decimalSaldo = (valor: string) =>
  valor
    .replace(/^R\$\s*/, "")
    .replace(/\./g, "")
    .replace(",", ".");
export const validarSaldo = (valor: string) => {
  const decimal = decimalSaldo(valor);
  return /^(?:0|[1-9]\d{0,16})\.\d{2}$/.test(decimal) && decimal !== "0.00"
    ? undefined
    : "Informe um saldo inicial positivo com até 17 dígitos inteiros.";
};
export const lancarSaldoInicial = async (
  request: Request,
  contaId: number,
  valor: string,
) =>
  readJson<{ id: number }>(
    await request("/movimentacoes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tipo: "ENTRADA",
        origem: "SALDO_INICIAL",
        descricao: "Saldo inicial da conta",
        valor,
        data: dayjs().format("YYYY-MM-DD"),
        contaDestinoId: contaId,
      }),
    }),
  );
