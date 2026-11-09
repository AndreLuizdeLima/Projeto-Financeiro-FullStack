import { useState } from "react";
import type { PlanoDeContasVM } from "./usePlanoDeContasViewModel";
import type {
  TipoPlano,
  CriarPlano,
  EditarPlano,
} from "../model/plano-de-contas";

export function usePlanoFormularioViewModel(vm: PlanoDeContasVM) {
  const modal = vm.modal!;
  const conta = modal.conta;
  const paiInicial = vm.pais.find((p) => p.conta.id === modal.paiId);
  const [nome, setNome] = useState(conta?.nome ?? "");
  const [tipo, setTipo] = useState<TipoPlano>(
    conta?.tipo ?? paiInicial?.conta.tipo ?? "ATIVO",
  );
  const [paiId, setPaiId] = useState<number | null>(modal.paiId ?? null);
  const [erros, setErros] = useState<{ nome?: string; pai?: string }>({});
  const alterarPai = (id: number | null) => {
    setPaiId(id);
    const pai = vm.pais.find((p) => p.conta.id === id);
    if (pai) setTipo(pai.conta.tipo);
  };
  const criar = modal.modo === "criar",
    leitura = modal.modo === "consultar";
  const alterado = criar || nome.trim() !== conta?.nome || tipo !== conta?.tipo;
  const enviar = async () => {
    if (vm.ocupado || leitura) return;
    const novos = {
      nome: nome.trim() ? undefined : "Informe o nome da conta.",
      pai:
        criar && !vm.pais.some((p) => p.conta.id === paiId)
          ? "Selecione uma conta pai válida abaixo do nível 10."
          : undefined,
    };
    setErros(novos);
    if (novos.nome || novos.pai || !alterado) return;
    const payload: CriarPlano | EditarPlano = criar
      ? { nome: nome.trim(), tipo, natureza: "ANALITICA", contaPaiId: paiId! }
      : {
          ...(nome.trim() !== conta!.nome ? { nome: nome.trim() } : {}),
          ...(conta!.natureza === "ANALITICA" && tipo !== conta!.tipo
            ? { tipo }
            : {}),
        };
    await vm.salvar(payload);
  };
  return {
    nome,
    setNome,
    tipo,
    setTipo,
    paiId,
    alterarPai,
    erros,
    criar,
    leitura,
    alterado,
    enviar,
  };
}
