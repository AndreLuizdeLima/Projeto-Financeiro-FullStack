import {
  criarCadastroApi,
  type Registro,
} from "@/app/cadastros/model/cadastro";
export interface CriarFormaRecebimento {
  nome: string;
}
export type AtualizarFormaRecebimento = Partial<CriarFormaRecebimento> & {
  isActive: boolean;
};
export type FormaRecebimento = Registro & CriarFormaRecebimento;
export const api = criarCadastroApi<
  FormaRecebimento,
  CriarFormaRecebimento,
  AtualizarFormaRecebimento
>("/formas-recebimento");
