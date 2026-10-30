import { useCadastro } from "@/app/cadastros/view-model/useCadastro";
import { api } from "../model/usuarios";
export const useUsuarioViewModel = () =>
  useCadastro(api, {
    nome: (item) => item.nome,
    podeEditar: (item) => item.isActive,
  });
