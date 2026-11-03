import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/auth/useAuth";
import { ApiError } from "@/lib/http";
import { toast } from "@/components/ui/toast";
import { formatarData, formatarValor, type TipoConta } from "../model/contas";
import {
  carregarOpcoesLiquidacao,
  consultarPreviaLiquidacao,
  liquidarConta,
  type OpcoesLiquidacao,
  type PreviaLiquidacao,
} from "../model/conta-liquidacao";

export type ContaLiquidacaoProps = {
  id: number;
  tipo: TipoConta;
  focoRetorno: HTMLElement;
  fechar: () => void;
  aoConcluir: () => void;
  aoAtualizar: () => void;
};
const mensagem = (erro: unknown) =>
  erro instanceof Error
    ? erro.message
    : "Não foi possível concluir a solicitação.";

export const useContaLiquidacaoViewModel = ({
  id,
  tipo,
  fechar,
  aoConcluir,
  aoAtualizar,
}: ContaLiquidacaoProps) => {
  const { request, getGeneration } = useAuth();
  const [consulta, setConsulta] = useState<{
    dataPagamento?: string;
    revisao: number;
  }>({ revisao: 0 });
  const [resultado, setResultado] = useState<{
    chave: typeof consulta;
    dados?: PreviaLiquidacao;
    erro?: string;
    bloqueada?: boolean;
  }>();
  const [tentativaOpcoes, setTentativaOpcoes] = useState(0);
  const [carga, setCarga] = useState<{
    tentativa: number;
    dados?: OpcoesLiquidacao;
    erro?: string;
  }>();
  const [bancoId, setBancoId] = useState<number | null>(null);
  const [formaId, setFormaId] = useState<number | null>(null);
  const [erros, setErros] = useState<{ banco?: string; forma?: string }>({});
  const [erroSalvar, setErroSalvar] = useState("");
  const [salvando, setSalvando] = useState(false);
  const ocupado = useRef(false);
  const montado = useRef(false);
  const leituraPrevia = useRef<AbortController | null>(null);
  const leituraOpcoes = useRef<AbortController | null>(null);

  useEffect(() => {
    montado.current = true;
    return () => {
      montado.current = false;
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    leituraOpcoes.current = controller;
    const geracao = getGeneration();
    carregarOpcoesLiquidacao(request, controller.signal)
      .then((dados) => {
        if (!controller.signal.aborted && geracao === getGeneration())
          setCarga({ tentativa: tentativaOpcoes, dados });
      })
      .catch((erro: unknown) => {
        if (!controller.signal.aborted && geracao === getGeneration())
          setCarga({ tentativa: tentativaOpcoes, erro: mensagem(erro) });
      });
    return () => controller.abort();
  }, [request, getGeneration, tentativaOpcoes]);

  useEffect(() => {
    const controller = new AbortController();
    leituraPrevia.current = controller;
    const geracao = getGeneration();
    consultarPreviaLiquidacao(
      request,
      id,
      controller.signal,
      consulta.dataPagamento,
    )
      .then((dados) => {
        if (controller.signal.aborted || geracao !== getGeneration()) return;
        if (dados.conta.tipo !== tipo) {
          setResultado({
            chave: consulta,
            bloqueada: true,
            erro: "Esta conta não pertence ao tipo desta tela.",
          });
          aoAtualizar();
          return;
        }
        setResultado({ chave: consulta, dados });
      })
      .catch((erro: unknown) => {
        if (controller.signal.aborted || geracao !== getGeneration()) return;
        const bloqueada =
          erro instanceof ApiError &&
          (erro.status === 409 || erro.status === 404);
        setResultado({ chave: consulta, erro: mensagem(erro), bloqueada });
        if (bloqueada) aoAtualizar();
      });
    return () => controller.abort();
  }, [request, getGeneration, id, tipo, consulta, aoAtualizar]);

  const atual = resultado?.chave === consulta ? resultado : undefined;
  const previa = atual?.dados;
  const identificacao = resultado?.dados;
  const opcoesAtuais = carga?.tentativa === tentativaOpcoes ? carga : undefined;
  const opcoes = opcoesAtuais?.dados;
  const semBancos = !!opcoes && !opcoes.bancos.length;
  const semFormas = !!opcoes && !opcoes.formas.length;
  const podeConfirmar =
    !!previa && !!opcoes && !semBancos && !semFormas && !salvando;
  const resumo = useMemo(
    () =>
      previa
        ? [
            {
              label: "Valor original",
              valor: formatarValor(previa.valorOriginal),
            },
            { label: "Dias de atraso", valor: String(previa.diasAtraso) },
            { label: "Juros", valor: formatarValor(previa.juros) },
            { label: "Multa", valor: formatarValor(previa.multa) },
          ]
        : [],
    [previa],
  );

  const alterarData = useCallback((dataPagamento: string) => {
    if (ocupado.current) return;
    setConsulta((atual) => ({ dataPagamento, revisao: atual.revisao + 1 }));
    setErroSalvar("");
  }, []);
  const alterarBanco = useCallback((id: number | null) => {
    if (ocupado.current) return;
    setBancoId(id);
    setErros((atual) => ({ ...atual, banco: undefined }));
    setErroSalvar("");
  }, []);
  const alterarForma = useCallback((id: number | null) => {
    if (ocupado.current) return;
    setFormaId(id);
    setErros((atual) => ({ ...atual, forma: undefined }));
    setErroSalvar("");
  }, []);
  const tentarPrevia = useCallback(() => {
    if (!ocupado.current)
      setConsulta((atual) => ({ ...atual, revisao: atual.revisao + 1 }));
  }, []);
  const tentarOpcoes = useCallback(() => {
    if (!ocupado.current) setTentativaOpcoes((atual) => atual + 1);
  }, []);
  const voltar = useCallback(() => {
    if (ocupado.current) return;
    leituraPrevia.current?.abort();
    leituraOpcoes.current?.abort();
    fechar();
  }, [fechar]);

  const confirmar = useCallback(async () => {
    if (ocupado.current || !podeConfirmar || !previa || !opcoes) return;
    const bancoValido = opcoes.bancos.some(
      (b) => b.id === bancoId && b.isActive,
    );
    const formaValida = opcoes.formas.some(
      (f) => f.id === formaId && f.isActive,
    );
    setErros({
      banco: bancoValido ? undefined : "Selecione uma conta bancária ativa.",
      forma: formaValida ? undefined : "Selecione uma forma ativa.",
    });
    if (!bancoValido || !formaValida || bancoId === null || formaId === null)
      return;
    ocupado.current = true;
    setSalvando(true);
    setErroSalvar("");
    const geracao = getGeneration();
    try {
      const resultado = await liquidarConta(request, id, {
        dataPagamento: previa.dataPagamento,
        contaBancariaId: bancoId,
        formaRecebimentoId: formaId,
        valorTotalEsperado: previa.valorTotal,
      });
      if (!montado.current || geracao !== getGeneration()) return;
      toast.add({
        type: "success",
        title: tipo === "PAGAR" ? "Conta paga." : "Conta recebida.",
        description: `Valor liquidado: ${formatarValor(resultado.liquidacao.valorTotal)}`,
      });
      aoConcluir();
    } catch (erro: unknown) {
      if (!montado.current || geracao !== getGeneration()) return;
      setErroSalvar(mensagem(erro));
      if (erro instanceof ApiError && erro.status === 409) {
        setConsulta((atual) => ({
          dataPagamento: previa.dataPagamento,
          revisao: atual.revisao + 1,
        }));
      }
    } finally {
      ocupado.current = false;
      if (montado.current && geracao === getGeneration()) setSalvando(false);
    }
  }, [
    podeConfirmar,
    previa,
    opcoes,
    bancoId,
    formaId,
    request,
    getGeneration,
    id,
    tipo,
    aoConcluir,
  ]);

  return {
    titulo: tipo === "PAGAR" ? "Pagar conta" : "Receber conta",
    labelData:
      tipo === "PAGAR" ? "Data do pagamento *" : "Data do recebimento *",
    labelBanco:
      tipo === "PAGAR"
        ? "Conta bancária de origem *"
        : "Conta bancária de destino *",
    labelForma:
      tipo === "PAGAR" ? "Forma de pagamento *" : "Forma de recebimento *",
    labelTotal: tipo === "PAGAR" ? "Total a pagar" : "Total a receber",
    labelConfirmar:
      tipo === "PAGAR" ? "Confirmar pagamento" : "Confirmar recebimento",
    identificacao,
    resumo,
    valorTotal: previa ? formatarValor(previa.valorTotal) : "—",
    vencimento: identificacao
      ? formatarData(identificacao.conta.dataVencimento)
      : "—",
    dataPagamento: consulta.dataPagamento ?? previa?.dataPagamento ?? "",
    dataMinima: identificacao?.conta.dataEmissao,
    dataMaxima: identificacao?.dataAtual,
    carregandoPrevia: !atual,
    erroPrevia: atual?.erro,
    bloqueada: !!atual?.bloqueada,
    carregandoOpcoes: !opcoesAtuais,
    erroOpcoes: opcoesAtuais?.erro,
    opcoes,
    semBancos,
    semFormas,
    bancoId,
    formaId,
    erros,
    salvando,
    erroSalvar,
    podeConfirmar,
    alterarData,
    alterarBanco,
    alterarForma,
    tentarPrevia,
    tentarOpcoes,
    voltar,
    confirmar,
  };
};
