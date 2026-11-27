import { useCallback, useEffect, useState } from "react";
import dayjs from "dayjs";
import debounce from "lodash/debounce";
import type { DateRange } from "react-day-picker";
import { useAuth } from "@/auth/useAuth";
import type { ContaBancaria } from "@/app/contas-bancarias/model/contas-bancarias";
import {
  carregarBancos,
  consultar,
  dataFormatada,
  filtrosIniciais,
  listar,
  moeda,
  moedaCentavos,
  origens,
  resumir,
  tipos,
  totaisResumo,
  validarPeriodo,
  type Filtros,
  type TipoMovimento,
} from "../model/movimentacoes";

function useConsulta<T>(buscar: (signal: AbortSignal) => Promise<T>) {
  const [revisao, setRevisao] = useState(0);
  const [resultado, setResultado] = useState<{
    buscar: typeof buscar;
    revisao: number;
    dados?: T;
    erro?: string;
  }>();
  useEffect(() => {
    const controller = new AbortController();
    buscar(controller.signal)
      .then((dados) => {
        if (!controller.signal.aborted)
          setResultado({ buscar, revisao, dados });
      })
      .catch((erro: unknown) => {
        if (!controller.signal.aborted)
          setResultado({
            buscar,
            revisao,
            erro:
              erro instanceof Error
                ? erro.message
                : "Não foi possível carregar os dados.",
          });
      });
    return () => controller.abort();
  }, [buscar, revisao]);
  const atual =
    resultado?.buscar === buscar && resultado.revisao === revisao
      ? resultado
      : undefined;
  return {
    dados: atual?.dados,
    erro: atual?.erro,
    carregando: !atual,
    recarregar: () => setRevisao((r) => r + 1),
  };
}

export const useMovimentacoesViewModel = () => {
  const { request } = useAuth();
  const [filtros, setFiltros] = useState(filtrosIniciais);
  const [consulta, setConsulta] = useState(() => ({ filtros, page: 1 }));
  const [modal, setModal] = useState<{
    id: number;
    focoRetorno: HTMLElement;
  } | null>(null);
  const [lancamento, setLancamento] = useState<{
    tipo: TipoMovimento;
    focoRetorno: HTMLElement;
  } | null>(null);
  const [menuLancamento, setMenuLancamento] = useState(false);
  const erroPeriodo = validarPeriodo(filtros);
  const atualizar = useState(() =>
    debounce(
      (f: Filtros) =>
        setConsulta((atual) =>
          atual.filtros === f ? atual : { filtros: f, page: 1 },
        ),
      400,
    ),
  )[0];
  useEffect(() => {
    if (!validarPeriodo(filtros)) atualizar(filtros);
    return () => atualizar.cancel();
  }, [filtros, atualizar]);
  const buscarLista = useCallback(
    (signal: AbortSignal) =>
      listar(request, consulta.filtros, consulta.page, signal),
    [request, consulta],
  );
  const buscarResumo = useCallback(
    (signal: AbortSignal) => resumir(request, consulta.filtros, signal),
    [request, consulta.filtros],
  );
  const buscarBancos = useCallback(
    (signal: AbortSignal) => carregarBancos(request, signal),
    [request],
  );
  const lista = useConsulta(buscarLista);
  const resumo = useConsulta(buscarResumo);
  const bancos = useConsulta(buscarBancos);
  const nomeBanco = (id: number | null) =>
    id === null
      ? "—"
      : (bancos.dados?.find((b) => b.id === id)?.nome ?? `Conta #${id}`);
  const total = totaisResumo(resumo.dados ?? []);
  return {
    filtros,
    lancamento,
    menuLancamento,
    setMenuLancamento,
    abrirLancamento: (tipo: TipoMovimento) => {
      const focoRetorno = document.getElementById("lancar-movimentacao");
      if (!focoRetorno) return;
      setMenuLancamento(false);
      setLancamento({ tipo, focoRetorno });
    },
    fecharLancamento: () => setLancamento(null),
    lancamentoSalvo: () => {
      setLancamento(null);
      lista.recarregar();
      resumo.recarregar();
    },
    erroPeriodo,
    lista,
    resumo,
    bancos,
    modal,
    alterarFiltro: <K extends keyof Filtros>(campo: K, valor: Filtros[K]) =>
      setFiltros((f) => ({ ...f, [campo]: valor })),
    periodo: {
      from: filtros.dataInicial
        ? dayjs(filtros.dataInicial).toDate()
        : undefined,
      to: filtros.dataFinal ? dayjs(filtros.dataFinal).toDate() : undefined,
    },
    periodoTexto: filtros.dataInicial
      ? `${dataFormatada(filtros.dataInicial)} — ${filtros.dataFinal ? dataFormatada(filtros.dataFinal) : "Selecione o fim"}`
      : "Selecionar período",
    alterarPeriodo: (p: DateRange | undefined) =>
      setFiltros((f) => ({
        ...f,
        dataInicial: p?.from ? dayjs(p.from).format("YYYY-MM-DD") : "",
        dataFinal: p?.to ? dayjs(p.to).format("YYYY-MM-DD") : "",
      })),
    opcoesBancos: (bancos.dados ?? []).map((b) => ({
      id: b.id,
      label: `${b.nome}${b.isActive ? "" : " (inativa)"}`,
      isActive: b.isActive,
    })),
    linhas: (lista.dados?.data ?? []).map((m) => ({
      ...m,
      dataTexto: dataFormatada(m.data),
      valorTexto: moeda(m.valor),
      tipoTexto: tipos[m.tipo],
      origemTexto: origens[m.origem],
      bancoOrigem: nomeBanco(m.contaOrigemId),
      bancoDestino: nomeBanco(m.contaDestinoId),
    })),
    totais: {
      ENTRADA: moedaCentavos(total.ENTRADA),
      SAIDA: moedaCentavos(total.SAIDA),
      TRANSFERENCIA: moedaCentavos(total.TRANSFERENCIA),
    },
    page: consulta.page,
    mudarPagina: (page: number) => setConsulta((c) => ({ ...c, page })),
    abrirDetalhes: (id: number, focoRetorno: HTMLElement) =>
      setModal({ id, focoRetorno }),
    fecharDetalhes: () => setModal(null),
  };
};
export type MovimentacoesViewModel = ReturnType<
  typeof useMovimentacoesViewModel
>;

export const useMovimentoDetalhesViewModel = (
  id: number,
  bancos: ContaBancaria[] | undefined,
) => {
  const { request } = useAuth();
  const buscar = useCallback(
    (signal: AbortSignal) => consultar(request, id, signal),
    [request, id],
  );
  const consulta = useConsulta(buscar);
  const m = consulta.dados;
  const nomeBanco = (id: number | null) =>
    id === null
      ? "—"
      : (bancos?.find((b) => b.id === id)?.nome ?? `Conta #${id}`);
  return {
    ...consulta,
    campos: m
      ? [
          ["Data", dataFormatada(m.data)],
          ["Descrição", m.descricao],
          ["Tipo", tipos[m.tipo]],
          ["Origem", origens[m.origem]],
          ["Valor", moeda(m.valor)],
          ["Conta de origem", nomeBanco(m.contaOrigemId)],
          ["Conta de destino", nomeBanco(m.contaDestinoId)],
          [
            "Conta vinculada",
            m.liquidacao
              ? `#${m.liquidacao.contaId}${m.liquidacao.conta?.descricao ? ` · ${m.liquidacao.conta.descricao}` : ""}`
              : "—",
          ],
          ["Liquidação", m.liquidacaoId ?? "—"],
          ["Movimentação original", m.estornoDeId ?? "—"],
          ["Cliente (ID)", m.clienteId ?? "—"],
          ["Plano de contas (ID)", m.planoDeContaId ?? "—"],
          ["Centro de custo (ID)", m.centroDeCustoId ?? "—"],
          ["Forma de recebimento (ID)", m.formaRecebimentoId ?? "—"],
          ["Criado por (ID)", m.criadoPorId],
          ["Criado em", dayjs(m.criadoEm).format("DD/MM/YYYY HH:mm")],
        ]
      : [],
  };
};
