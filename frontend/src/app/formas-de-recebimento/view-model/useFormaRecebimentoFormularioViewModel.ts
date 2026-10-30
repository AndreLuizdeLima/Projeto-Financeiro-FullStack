import {
  useFormulario,
  obrigatorio,
  type Erros,
} from "@/app/cadastros/view-model/useFormulario";
import type { FormularioProps } from "@/app/cadastros/model/cadastro";
import {
  type FormaRecebimento,
  type CriarFormaRecebimento,
  type AtualizarFormaRecebimento,
} from "../model/formas-de-recebimento";
type Valores = { nome: string };
export type Props = FormularioProps<
  FormaRecebimento,
  CriarFormaRecebimento,
  AtualizarFormaRecebimento
>;
export const useFormaRecebimentoFormularioViewModel = ({
  registro,
  modo,
  salvar,
}: Props) => {
  const form = useFormulario<Valores>(
    { nome: registro?.nome ?? "" },
    (valores) => {
      const erros: Erros<Valores> = {};
      {
        const erro = obrigatorio(valores.nome);
        if (erro) erros.nome = erro;
      }
      return erros;
    },
  );
  const enviar = async () => {
    if (modo === "consultar" || !form.validarFormulario()) return false;
    const payload = { nome: form.valores.nome.trim() };
    if (modo === "criar") return salvar(payload);
    return salvar({ ...payload, isActive: registro!.isActive });
  };
  return { ...form, enviar, somenteLeitura: modo === "consultar" };
};
