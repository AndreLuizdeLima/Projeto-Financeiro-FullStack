import {
  useFormulario,
  obrigatorio,
  type Erros,
} from "@/app/cadastros/view-model/useFormulario";
import type { FormularioProps } from "@/app/cadastros/model/cadastro";
import {
  type Cliente,
  type CriarCliente,
  type AtualizarCliente,
} from "../model/clientes";
type Valores = { cnpj: string; razaoSocial: string; nomeFantasia: string };
export type Props = FormularioProps<Cliente, CriarCliente, AtualizarCliente>;
export const useClienteFormularioViewModel = ({
  registro,
  modo,
  salvar,
}: Props) => {
  const form = useFormulario<Valores>(
    {
      cnpj: registro?.cnpj ?? "",
      razaoSocial: registro?.razaoSocial ?? "",
      nomeFantasia: registro?.nomeFantasia ?? "",
    },
    (valores) => {
      const erros: Erros<Valores> = {};
      {
        const erro = obrigatorio(valores.cnpj);
        if (erro) erros.cnpj = erro;
      }
      {
        const erro = obrigatorio(valores.razaoSocial, 100);
        if (erro) erros.razaoSocial = erro;
      }
      {
        const erro = obrigatorio(valores.nomeFantasia, 100);
        if (erro) erros.nomeFantasia = erro;
      }
      return erros;
    },
  );
  const enviar = async () => {
    if (modo === "consultar" || !form.validarFormulario()) return false;
    const payload = {
      cnpj: form.valores.cnpj,
      razaoSocial: form.valores.razaoSocial.trim(),
      nomeFantasia: form.valores.nomeFantasia.trim(),
    };
    if (modo === "criar") return salvar(payload);
    return salvar({ ...payload, isActive: registro!.isActive });
  };
  return { ...form, enviar, somenteLeitura: modo === "consultar" };
};
