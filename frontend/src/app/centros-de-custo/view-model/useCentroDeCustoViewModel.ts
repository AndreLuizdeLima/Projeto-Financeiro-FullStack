import { useCadastro } from "@/app/cadastros/view-model/useCadastro";
import { api } from "../model/centros-de-custo";
export const useCentroDeCustoViewModel = () =>
  useCadastro(api, {
    nome: (item) => item.nome,
    podeEditar: () => true,
    reativacao: () => ({ isActive: true }),
  });
