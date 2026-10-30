import {
  criarCadastroApi,
  type Registro,
} from "@/app/cadastros/model/cadastro";
export interface CriarCentroDeCusto {
  nome: string;
}
export type AtualizarCentroDeCusto = Partial<CriarCentroDeCusto> & {
  isActive: boolean;
};
export type CentroDeCusto = Registro & CriarCentroDeCusto;
export const api = criarCadastroApi<
  CentroDeCusto,
  CriarCentroDeCusto,
  AtualizarCentroDeCusto
>("/centro-de-custo");
