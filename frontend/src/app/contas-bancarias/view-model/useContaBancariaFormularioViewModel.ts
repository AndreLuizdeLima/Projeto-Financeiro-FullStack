import { mascaraValor } from "@/lib/mascara-valor";
import { decimalSaldo, validarSaldo } from "../model/saldo-inicial";
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
  type CriarContaComSaldo,
  type AtualizarContaBancaria,
} from "../model/contas-bancarias";
type Valores = {
  nome: string;
  conta: string;
  tipo: TipoConta;
  incluirSaldo: boolean;
  saldoInicial: string;
};
export type Props = FormularioProps<
  ContaBancaria,
  CriarContaComSaldo,
  AtualizarContaBancaria
> & { contaCriada?: boolean };
export const useContaBancariaFormularioViewModel = ({
  registro,
  modo,
  salvar,
  contaCriada,
}: Props) => {
  const form = useFormulario<Valores>(
    {
      nome: registro?.nome ?? "",
      conta: registro?.conta ?? "",
      tipo: registro?.tipo ?? "ContaCorrente",
      incluirSaldo: false,
      saldoInicial: "",
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
      if (modo === "criar" && valores.incluirSaldo) {
        const erro = validarSaldo(valores.saldoInicial);
        if (erro) erros.saldoInicial = erro;
      }
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
    if (modo === "criar")
      return salvar({
        ...payload,
        ...(form.valores.incluirSaldo
          ? { saldoInicial: decimalSaldo(form.valores.saldoInicial) }
          : {}),
      });
    return salvar({ ...payload, isActive: registro!.isActive });
  };
  return {
    ...form,
    enviar,
    somenteLeitura: modo === "consultar" || !!contaCriada,
    exibirSaldo: modo === "criar",
    alterarSaldo: (valor: string) =>
      form.alterar("saldoInicial", mascaraValor(valor)),
  };
};
