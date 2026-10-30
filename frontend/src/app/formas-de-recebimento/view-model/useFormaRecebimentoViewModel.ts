import { useCadastro } from "@/app/cadastros/view-model/useCadastro";
import { api } from "../model/formas-de-recebimento";
export const useFormaRecebimentoViewModel = () =>
  useCadastro(api, {
    nome: (item) => item.nome,
    podeEditar: () => true,
    reativacao: () => ({ isActive: true }),
  });
