import { useCadastro } from "@/app/cadastros/view-model/useCadastro";
import { api } from "../model/clientes";
export const useClienteViewModel = () =>
  useCadastro(api, {
    nome: (item) => item.nomeFantasia,
    podeEditar: () => true,
    reativacao: () => ({ isActive: true }),
  });
