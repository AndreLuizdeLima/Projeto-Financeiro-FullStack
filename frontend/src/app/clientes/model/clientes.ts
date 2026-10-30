import {
  criarCadastroApi,
  type Registro,
} from "@/app/cadastros/model/cadastro";
export interface CriarCliente {
  cnpj: string;
  razaoSocial: string;
  nomeFantasia: string;
}
export type AtualizarCliente = Partial<CriarCliente> & { isActive: boolean };
export type Cliente = Registro & CriarCliente;
export const api = criarCadastroApi<Cliente, CriarCliente, AtualizarCliente>(
  "/cliente",
);
