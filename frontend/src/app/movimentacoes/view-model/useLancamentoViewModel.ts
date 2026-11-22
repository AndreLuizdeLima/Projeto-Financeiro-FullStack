import { useEffect, useRef, useState } from "react";
import dayjs from "dayjs";
import { useAuth } from "@/auth/useAuth";
import { toast } from "@/components/ui/toast";
import { mascaraValor } from "@/lib/mascara-valor";
import {
  carregarBancos,
  tipos,
  type TipoMovimento,
} from "../model/movimentacoes";
import type { ContaBancaria } from "@/app/contas-bancarias/model/contas-bancarias";
import {
  criarLancamento,
  validarLancamento,
  valoresIniciais,
  type ValoresLancamento,
  type ErrosLancamento,
} from "../model/lancamento";

export type LancamentoProps = {
  tipo: TipoMovimento;
  focoRetorno: HTMLElement;
  fechar: () => void;
  aoSalvar: () => void;
};
export const useLancamentoViewModel = ({
  tipo,
  fechar,
  aoSalvar,
}: LancamentoProps) => {
  const { request, getGeneration } = useAuth();
  const [valores, setValores] = useState(valoresIniciais);
  const [erros, setErros] = useState<ErrosLancamento>({});
  const [erroSalvar, setErroSalvar] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [tentativa, setTentativa] = useState(0);
  const [carga, setCarga] = useState<{
    tentativa: number;
    bancos?: ContaBancaria[];
    erro?: string;
  }>();
  const bloqueio = useRef(false);
  const montado = useRef(false);
  useEffect(() => {
    montado.current = true;
    const controller = new AbortController();
    const geracao = getGeneration();
    carregarBancos(request, controller.signal)
      .then((bancos) => {
        if (!controller.signal.aborted && geracao === getGeneration())
          setCarga({ tentativa, bancos });
      })
      .catch((erro: unknown) => {
        if (!controller.signal.aborted && geracao === getGeneration())
          setCarga({
            tentativa,
            erro:
              erro instanceof Error
                ? erro.message
                : "Não foi possível carregar as contas bancárias.",
          });
      });
    return () => {
      montado.current = false;
      controller.abort();
    };
  }, [request, getGeneration, tentativa]);
  const atual = carga?.tentativa === tentativa ? carga : undefined;
  const bancos = atual?.bancos ?? [];
  const semContas =
    !!atual?.bancos &&
    bancos.filter((b) => b.isActive).length <
      (tipo === "TRANSFERENCIA" ? 2 : 1);
  const enviar = async () => {
    if (bloqueio.current || !atual?.bancos || semContas) return;
    const validacao = validarLancamento(
      valores,
      bancos,
      dayjs().format("YYYY-MM-DD"),
      tipo,
    );
    setErros(validacao);
    setErroSalvar("");
    if (Object.keys(validacao).length) return;
    bloqueio.current = true;
    setSalvando(true);
    const geracao = getGeneration();
    try {
      await criarLancamento(request, valores, tipo);
      if (!montado.current || geracao !== getGeneration()) return;
      toast.add({ type: "success", title: `${tipos[tipo]} lançada.` });
      aoSalvar();
    } catch (erro: unknown) {
      if (montado.current && geracao === getGeneration())
        setErroSalvar(
          erro instanceof Error
            ? erro.message
            : "Não foi possível lançar a movimentação.",
        );
    } finally {
      bloqueio.current = false;
      if (montado.current && geracao === getGeneration()) setSalvando(false);
    }
  };
  return {
    titulo: `Lançar ${tipos[tipo].toLowerCase()}`,
    exibirOrigem: tipo !== "ENTRADA",
    exibirDestino: tipo !== "SAIDA",
    mensagemSemContas:
      tipo === "TRANSFERENCIA"
        ? "Cadastre pelo menos duas contas bancárias ativas para lançar uma transferência."
        : "Cadastre uma conta bancária ativa para lançar uma movimentação.",
    valores,
    erros,
    erroSalvar,
    salvando,
    semContas,
    carregando: !atual,
    erroCarga: atual?.erro,
    hoje: dayjs().format("YYYY-MM-DD"),
    opcoes: bancos
      .filter((b) => b.isActive)
      .map((b) => ({ id: b.id, label: b.nome, isActive: b.isActive })),
    alterar: <K extends keyof ValoresLancamento>(
      campo: K,
      valor: ValoresLancamento[K],
    ) => {
      if (!bloqueio.current)
        setValores((v) => ({
          ...v,
          [campo]: campo === "valor" ? mascaraValor(String(valor)) : valor,
        }));
    },
    fechar: () => {
      if (!bloqueio.current) fechar();
    },
    tentarNovamente: () => setTentativa((t) => t + 1),
    enviar,
  };
};
