import {
  useFormulario,
  obrigatorio,
  type Erros,
} from "@/app/cadastros/view-model/useFormulario";
import type { FormularioProps } from "@/app/cadastros/model/cadastro";
import {
  type Usuario,
  type CriarUsuario,
  type AtualizarUsuario,
} from "../model/usuarios";
type Valores = {
  nome: string;
  email: string;
  password: string;
  confirmacao: string;
};
export type Props = FormularioProps<Usuario, CriarUsuario, AtualizarUsuario>;
export const useUsuarioFormularioViewModel = ({
  registro,
  modo,
  salvar,
}: Props) => {
  const form = useFormulario<Valores>(
    {
      nome: registro?.nome ?? "",
      email: registro?.email ?? "",
      password: "",
      confirmacao: "",
    },
    (valores) => {
      const erros: Erros<Valores> = {};
      {
        const erro = obrigatorio(valores.nome, 100);
        if (erro) erros.nome = erro;
      }
      {
        const erro = obrigatorio(valores.email);
        if (erro) erros.email = erro;
      }
      if (valores.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valores.email))
        erros.email = "Informe um e-mail válido.";
      if (modo === "criar" && !valores.password.trim())
        erros.password = "Informe a senha.";
      if (
        (modo === "criar" || valores.password) &&
        valores.password !== valores.confirmacao
      )
        erros.confirmacao = "As senhas devem ser iguais.";
      return erros;
    },
  );
  const enviar = async () => {
    if (modo === "consultar" || !form.validarFormulario()) return false;
    const payload = {
      nome: form.valores.nome.trim(),
      email: form.valores.email.trim(),
      ...(form.valores.password ? { password: form.valores.password } : {}),
    };
    if (modo === "criar")
      return salvar({ ...payload, password: form.valores.password });
    return salvar({ ...payload, isActive: registro!.isActive });
  };
  return { ...form, enviar, somenteLeitura: modo === "consultar" };
};
