import {
  criarCadastroApi,
  type Registro,
} from "@/app/cadastros/model/cadastro";
export type TipoConta = "ContaCorrente" | "ContaPoupanca" | "ContaSalario";
export const tiposConta: Record<TipoConta, string> = {
  ContaCorrente: "Conta corrente",
  ContaPoupanca: "Conta poupança",
  ContaSalario: "Conta salário",
};
export interface CriarContaBancaria {
  nome: string;
  conta: string;
  tipo: TipoConta;
}
export type AtualizarContaBancaria = Partial<CriarContaBancaria> & {
  isActive: boolean;
};
export type ContaBancaria = Registro & CriarContaBancaria;
export const api = criarCadastroApi<
  ContaBancaria,
  CriarContaBancaria,
  AtualizarContaBancaria
>("/conta-bancaria");
