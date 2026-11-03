import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/auth/useAuth";
import { ApiError } from "@/lib/http";
import { toast } from "@/components/ui/toast";
import { cancelarConta, type Conta } from "../model/contas";

export type ContaParaCancelar = Pick<
  Conta,
  "id" | "descricao" | "valorOriginal" | "situacao"
>;
export type ConfirmacaoCancelamento = {
  conta: ContaParaCancelar;
  focoRetorno: HTMLElement;
  erro?: string;
  bloqueada?: boolean;
};

export const useContaCancelamentoViewModel = (recarregar: () => void) => {
  const { request, getGeneration } = useAuth();
  const [confirmacao, setConfirmacao] =
    useState<ConfirmacaoCancelamento | null>(null);
  const [cancelando, setCancelando] = useState(false);
  const bloqueio = useRef(false);
  const montado = useRef(false);

  useEffect(() => {
    montado.current = true;
    return () => {
      montado.current = false;
    };
  }, []);

  const solicitarCancelamento = useCallback(
    (conta: ContaParaCancelar, focoRetorno: HTMLElement) => {
      if (bloqueio.current || conta.situacao !== "ABERTA") return;
      setConfirmacao({ conta, focoRetorno });
    },
    [],
  );

  const fecharCancelamento = useCallback(() => {
    if (!bloqueio.current) setConfirmacao(null);
  }, []);

  const confirmarCancelamento = useCallback(async () => {
    if (
      bloqueio.current ||
      !confirmacao ||
      confirmacao.bloqueada ||
      confirmacao.conta.situacao !== "ABERTA"
    )
      return;
    bloqueio.current = true;
    setCancelando(true);
    setConfirmacao((atual) => atual && { ...atual, erro: undefined });
    const geracao = getGeneration();
    try {
      await cancelarConta(request, confirmacao.conta.id);
      if (!montado.current || geracao !== getGeneration()) return;
      setConfirmacao(null);
      toast.add({ type: "success", title: "Conta cancelada." });
      recarregar();
    } catch (erro: unknown) {
      if (!montado.current || geracao !== getGeneration()) return;
      const conflito = erro instanceof ApiError && erro.status === 409;
      setConfirmacao(
        (atual) =>
          atual && {
            ...atual,
            erro: conflito
              ? "Esta conta não está mais aberta e não pode ser cancelada. A listagem foi atualizada."
              : erro instanceof Error
                ? erro.message
                : "Não foi possível cancelar a conta.",
            bloqueada: conflito,
          },
      );
      if (conflito) recarregar();
    } finally {
      bloqueio.current = false;
      if (montado.current && geracao === getGeneration()) setCancelando(false);
    }
  }, [confirmacao, request, getGeneration, recarregar]);

  return {
    confirmacao,
    cancelando,
    solicitarCancelamento,
    fecharCancelamento,
    confirmarCancelamento,
  };
};
