import { useCadastro } from "@/app/cadastros/view-model/useCadastro";
import { api } from "../model/contas-bancarias";
export const useContaBancariaViewModel = () =>
  useCadastro(api, {
    nome: (item) => item.nome,
    podeEditar: () => true,
    reativacao: () => ({ isActive: true }),
  });
