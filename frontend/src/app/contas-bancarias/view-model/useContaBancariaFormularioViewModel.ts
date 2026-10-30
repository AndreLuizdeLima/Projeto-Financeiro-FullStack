import {
  useFormulario,
  obrigatorio,
  type Erros,
} from "@/app/cadastros/view-model/useFormulario";
import type { FormularioProps } from "@/app/cadastros/model/cadastro";
import {
  tiposConta,
  type TipoConta,
  type ContaBancaria,
  type CriarContaBancaria,
  type AtualizarContaBancaria,
} from "../model/contas-bancarias";
type Valores = { nome: string; conta: string; tipo: TipoConta };
export type Props = FormularioProps<
  ContaBancaria,
  CriarContaBancaria,
  AtualizarContaBancaria
>;
export const useContaBancariaFormularioViewModel = ({
  registro,
  modo,
  salvar,
}: Props) => {
  const form = useFormulario<Valores>(
    {
      nome: registro?.nome ?? "",
      conta: registro?.conta ?? "",
      tipo: registro?.tipo ?? "ContaCorrente",
    },
    (valores) => {
      const erros: Erros<Valores> = {};
      {
        const erro = obrigatorio(valores.nome);
        if (erro) erros.nome = erro;
      }
      {
        const erro = obrigatorio(valores.conta);
        if (erro) erros.conta = erro;
      }
      if (!Object.hasOwn(tiposConta, valores.tipo))
        erros.tipo = "Selecione um tipo válido.";
      return erros;
    },
  );
  const enviar = async () => {
    if (modo === "consultar" || !form.validarFormulario()) return false;
    const payload = {
      nome: form.valores.nome.trim(),
      conta: form.valores.conta.trim(),
      tipo: form.valores.tipo,
    };
    if (modo === "criar") return salvar(payload);
    return salvar({ ...payload, isActive: registro!.isActive });
  };
  return { ...form, enviar, somenteLeitura: modo === "consultar" };
};
