import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/auth/useAuth";
import { mascaraValor } from "@/lib/mascara-valor";
import { ApiError } from "@/lib/http";
import { toast } from "@/components/ui/toast";
import {
  carregarReferenciasConta,
  consultarConta,
  salvarConta,
  valoresIniciaisConta,
  validarConta,
  payloadConta,
  opcoesContaAtual,
  type DetalheConta,
  type ErrosConta,
  type ReferenciasConta,
  type ValoresConta,
} from "../model/conta-formulario";
import type { TipoConta } from "../model/contas";

export type ContaFormularioProps = {
  tipo: TipoConta;
  focoRetorno?: HTMLElement;
  id?: number;
  fechar: () => void;
  aoSalvar: (criacao: boolean) => void;
};
const mensagem = (erro: unknown) =>
  erro instanceof Error
    ? erro.message
    : "Não foi possível concluir a solicitação.";

export const useContaFormularioViewModel = ({
  tipo,
  id,
  fechar,
  aoSalvar,
}: ContaFormularioProps) => {
  const { request, getGeneration } = useAuth();
  const [tentativa, setTentativa] = useState(0);
  const [carga, setCarga] = useState<{
    tentativa: number;
    referencias?: ReferenciasConta;
    conta?: DetalheConta;
    erro?: string;
  }>();
  const [valores, setValores] = useState<ValoresConta>(valoresIniciaisConta);
  const [encargosAtivos, setEncargosAtivos] = useState(false);
  const [erros, setErros] = useState<ErrosConta>({});
  const [erroSalvar, setErroSalvar] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [bloqueada, setBloqueada] = useState(false);
  const bloqueio = useRef(false);
  const montado = useRef(false);
  const leitura = useRef<AbortController | null>(null);

  useEffect(() => {
    montado.current = true;
    const controller = new AbortController();
    leitura.current = controller;
    const geracao = getGeneration();
    Promise.all([
      carregarReferenciasConta(request, controller.signal),
      id === undefined
        ? Promise.resolve(undefined)
        : consultarConta(request, id, controller.signal),
    ])
      .then(([referencias, conta]) => {
        if (controller.signal.aborted || geracao !== getGeneration()) return;
        setValores(valoresIniciaisConta(conta));
        setEncargosAtivos(
          !!conta &&
            (Number(conta.taxaJurosDiaria) > 0 || Number(conta.taxaMulta) > 0),
        );
        setCarga({
          tentativa,
          referencias: opcoesContaAtual(referencias, conta),
          conta,
        });
        setBloqueada(
          !!conta && (conta.situacao !== "ABERTA" || conta.tipo !== tipo),
        );
      })
      .catch((erro: unknown) => {
        if (!controller.signal.aborted && geracao === getGeneration())
          setCarga({ tentativa, erro: mensagem(erro) });
      });
    return () => {
      montado.current = false;
      controller.abort();
    };
  }, [request, getGeneration, id, tipo, tentativa]);

  const atual = carga?.tentativa === tentativa ? carga : undefined;
  const carregando = !atual;
  const referencias = atual?.referencias;
  const semCliente =
    !!referencias &&
    !referencias.clientes.some(
      (c) => c.isActive || c.id === atual?.conta?.clienteId,
    );
  const semPlano =
    !!referencias &&
    !referencias.planos.some(
      (p) => p.isActive || p.id === atual?.conta?.planoDeContaId,
    );
  const indisponivel = bloqueada || semCliente || semPlano;
  const enviar = async () => {
    if (bloqueio.current || carregando || !referencias || indisponivel) return;
    const resultado = validarConta(valores, referencias, atual?.conta);
    setErros(resultado);
    if (Object.keys(resultado).length) return;
    const payload = payloadConta(valores, tipo, atual?.conta);
    if (id !== undefined && !Object.keys(payload).length) {
      fechar();
      return;
    }
    bloqueio.current = true;
    setSalvando(true);
    setErroSalvar("");
    const geracao = getGeneration();
    try {
      await salvarConta(request, payload, id);
      if (!montado.current || geracao !== getGeneration()) return;
      toast.add({
        type: "success",
        title: id === undefined ? "Conta criada." : "Conta atualizada.",
        description: "A listagem foi atualizada.",
      });
      aoSalvar(id === undefined);
    } catch (erro: unknown) {
      if (!montado.current || geracao !== getGeneration()) return;
      setErroSalvar(mensagem(erro));
      if (id !== undefined && erro instanceof ApiError && erro.status === 409)
        setBloqueada(true);
    } finally {
      bloqueio.current = false;
      if (montado.current && geracao === getGeneration()) setSalvando(false);
    }
  };

  const alterarEncargos = useCallback(
    (ativo: boolean) => {
      if (salvando || bloqueada) return;
      setEncargosAtivos(ativo);
      if (!ativo) {
        setValores((atual) => ({
          ...atual,
          taxaJurosDiaria: "0",
          taxaMulta: "0",
        }));
        setErros((atual) => ({
          ...atual,
          taxaJurosDiaria: undefined,
          taxaMulta: undefined,
        }));
      }
      setErroSalvar("");
    },
    [salvando, bloqueada],
  );

  const alterarValor = useCallback((texto: string) => {
    const formatado = mascaraValor(texto).replace(/^R\$\s*/, "");
    setValores((atual) => ({ ...atual, valorOriginal: formatado }));
    setErros((atual) => ({ ...atual, valorOriginal: undefined }));
    setErroSalvar("");
  }, []);

  const alterar = useCallback(
    <K extends keyof ValoresConta>(campo: K, valor: ValoresConta[K]) => {
      if (
        (campo === "taxaJurosDiaria" || campo === "taxaMulta") &&
        typeof valor === "string" &&
        !/^\d{0,3}(?:,\d{0,3})?$/.test(valor)
      )
        return;
      setValores((atual) => ({ ...atual, [campo]: valor }));
      setErros((atual) => ({ ...atual, [campo]: undefined }));
      setErroSalvar("");
    },
    [],
  );

  return {
    valores,
    encargosAtivos,
    alterarEncargos,
    valorTexto: mascaraValor(valores.valorOriginal),
    alterarValor,
    erros,
    carregando,
    salvando,
    erroSalvar,
    erroCarga: atual?.erro,
    referencias,
    bloqueada,
    semCliente,
    semPlano,
    podeSalvar: !carregando && !!referencias && !indisponivel && !salvando,
    titulo:
      id === undefined
        ? `Adicionar conta a ${tipo === "PAGAR" ? "pagar" : "receber"}`
        : `Editar conta #${id}`,
    tentarNovamente: () => setTentativa((v) => v + 1),
    alterar,
    enviar,
    fechar: () => {
      if (bloqueio.current) return;
      leitura.current?.abort();
      fechar();
    },
  };
};
export type ContaFormularioViewModel = ReturnType<
  typeof useContaFormularioViewModel
>;
