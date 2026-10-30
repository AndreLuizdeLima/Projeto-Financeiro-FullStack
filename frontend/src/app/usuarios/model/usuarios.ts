import {
  criarCadastroApi,
  type Registro,
} from "@/app/cadastros/model/cadastro";
export interface CriarUsuario {
  nome: string;
  email: string;
  password: string;
}
export type AtualizarUsuario = Partial<CriarUsuario> & { isActive?: boolean };
export type Usuario = Registro & Omit<CriarUsuario, "password">;
export const api = criarCadastroApi<Usuario, CriarUsuario, AtualizarUsuario>(
  "/users",
);
