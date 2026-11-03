import { useContaCancelamentoViewModel } from "./useContaCancelamentoViewModel";
import { useCallback, useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import debounce from "lodash/debounce";
import type { DateRange } from "react-day-picker";
import { useAuth } from "@/auth/useAuth";
import {
  criarFiltrosIniciais,
  formatarData,
  formatarValor,
  listarContas,
  type FiltrosContas,
  type PaginaContas,
  type TipoConta,
} from "../model/contas";

const periodoCalendario = (inicio: string, fim: string): DateRange => ({
  from: inicio ? dayjs(inicio).toDate() : undefined,
  to: fim ? dayjs(fim).toDate() : undefined,
});
const textoPeriodo = (inicio: string, fim: string) =>
  inicio
    ? `${dayjs(inicio).format("DD/MM/YYYY")} — ${fim ? dayjs(fim).format("DD/MM/YYYY") : "Selecione o fim"}`
    : "Selecionar período";

type ErroPeriodo = { campo: "vencimento" | "emissao"; mensagem: string };

const validarPeriodo = (filtros: FiltrosContas): ErroPeriodo | undefined => {
  if (!filtros.dataInicial || !filtros.dataFinal) {
    return {
      campo: "vencimento",
      mensagem: "Selecione o início e o fim do período de vencimento.",
    };
  }
  if (
    filtros.dataInicial &&
    filtros.dataFinal &&
    filtros.dataInicial > filtros.dataFinal
  ) {
    return {
      campo: "vencimento",
      mensagem: "O vencimento inicial deve ser anterior ou igual ao final.",
    };
  }
  if (!!filtros.dataEmissaoInicial !== !!filtros.dataEmissaoFinal) {
    return {
      campo: "emissao",
      mensagem: "Selecione o início e o fim do período de emissão.",
    };
  }
  if (filtros.dataEmissaoInicial > filtros.dataEmissaoFinal) {
    return {
      campo: "emissao",
      mensagem: "A emissão inicial deve ser anterior ou igual à final.",
    };
  }
};

export const useContasViewModel = (tipo: TipoConta) => {
  const { request } = useAuth();

  const [modal, setModal] = useState<{
    id?: number;
    focoRetorno: HTMLElement;
  } | null>(null);

  const [filtros, setFiltros] = useState<FiltrosContas>(criarFiltrosIniciais);

  const [consulta, setConsulta] = useState(() => ({
    filtros,
    page: 1,
    revisao: 0,
  }));

  const [resultado, setResultado] = useState<{
    chave: typeof consulta;
    tipo: TipoConta;
    lista?: PaginaContas;
    erro?: string;
  }>();

  useEffect(() => {
    const controller = new AbortController();
    listarContas(
      request,
      tipo,
      consulta.filtros,
      consulta.page,
      controller.signal,
    )
      .then((lista) => {
        if (controller.signal.aborted) return;
        if (!lista.data.length && consulta.page > 1) {
          setConsulta((atual) =>
            atual === consulta
              ? {
                  ...atual,
                  page: Math.min(
                    consulta.page - 1,
                    Math.max(1, Math.ceil(lista.meta.total / 20)),
                  ),
                }
              : atual,
          );
          return;
        }
        setResultado({ chave: consulta, tipo, lista });
      })
      .catch((erro: unknown) => {
        if (!controller.signal.aborted)
          setResultado({
            chave: consulta,
            tipo,
            erro:
              erro instanceof Error
                ? erro.message
                : "Não foi possível carregar as contas.",
          });
      });
    return () => controller.abort();
  }, [request, tipo, consulta]);

  const atualizarConsulta = useMemo(
    () =>
      debounce((novosFiltros: FiltrosContas) => {
        setConsulta((atual) => {
          const iguais = (
            Object.keys(novosFiltros) as (keyof FiltrosContas)[]
          ).every((campo) => atual.filtros[campo] === novosFiltros[campo]);
          return iguais
            ? atual
            : {
                filtros: { ...novosFiltros },
                page: 1,
                revisao: atual.revisao + 1,
              };
        });
      }, 400),
    [],
  );

  useEffect(() => {
    if (!validarPeriodo(filtros)) atualizarConsulta(filtros);
    return () => atualizarConsulta.cancel();
  }, [filtros, atualizarConsulta]);

  const recarregar = useCallback(() => {
    setConsulta((atual) => ({ ...atual, revisao: atual.revisao + 1 }));
  }, []);
  const cancelamento = useContaCancelamentoViewModel(recarregar);

  const erroPeriodo = validarPeriodo(filtros);

  const atual =
    resultado?.chave === consulta && resultado.tipo === tipo
      ? resultado
      : undefined;

  const linhas = useMemo(
    () =>
      (atual?.lista?.data ?? []).map((conta) => ({
        ...conta,
        emissao: formatarData(conta.dataEmissao),
        vencimento: formatarData(conta.dataVencimento),
        valor: formatarValor(conta.valorOriginal),
        planoDeContaNome: conta.planoDeConta
          ? `${conta.planoDeConta.codigo} - ${conta.planoDeConta.nome}`
          : "—",
        centroDeCustoNome: conta.centroDeCusto?.nome ?? "—",
        vencidaEmAberto: conta.situacao === "ABERTA" && conta.vencida,
        situacaoTexto:
          conta.situacao === "ABERTA"
            ? conta.vencida
              ? "Vencida"
              : "Aberta"
            : conta.situacao === "CANCELADA"
              ? "Cancelada"
              : "Liquidada",
      })),
    [atual?.lista?.data],
  );
  return {
    tipo,
    modal,
    ...cancelamento,
    adicionarConta: (focoRetorno: HTMLElement) => setModal({ focoRetorno }),
    editarConta: (id: number, focoRetorno: HTMLElement) =>
      setModal({ id, focoRetorno }),
    fecharModal: () => setModal(null),
    contaSalva: (criacao: boolean) => {
      setModal(null);
      setConsulta((atual) => ({
        ...atual,
        page: criacao ? 1 : atual.page,
        revisao: atual.revisao + 1,
      }));
    },
    titulo: tipo === "PAGAR" ? "Contas a pagar" : "Contas a receber",
    periodo: periodoCalendario(filtros.dataInicial, filtros.dataFinal),
    periodoTexto: textoPeriodo(filtros.dataInicial, filtros.dataFinal),
    periodoEmissao: periodoCalendario(
      filtros.dataEmissaoInicial,
      filtros.dataEmissaoFinal,
    ),
    periodoEmissaoTexto: textoPeriodo(
      filtros.dataEmissaoInicial,
      filtros.dataEmissaoFinal,
    ),
    alterarPeriodoEmissao: (periodo: DateRange | undefined) => {
      setFiltros((atual) => ({
        ...atual,
        dataEmissaoInicial: periodo?.from
          ? dayjs(periodo.from).format("YYYY-MM-DD")
          : "",
        dataEmissaoFinal: periodo?.to
          ? dayjs(periodo.to).format("YYYY-MM-DD")
          : "",
      }));
    },
    limparPeriodoEmissao: () => {
      setFiltros((atual) => ({
        ...atual,
        dataEmissaoInicial: "",
        dataEmissaoFinal: "",
      }));
    },
    alterarPeriodo: (periodo: DateRange | undefined) => {
      setFiltros((atual) => ({
        ...atual,
        dataInicial: periodo?.from
          ? dayjs(periodo.from).format("YYYY-MM-DD")
          : "",
        dataFinal: periodo?.to ? dayjs(periodo.to).format("YYYY-MM-DD") : "",
      }));
    },
    filtros,
    erroFiltro: erroPeriodo?.mensagem,
    erroVencimento:
      erroPeriodo?.campo === "vencimento" ? erroPeriodo.mensagem : undefined,
    erroEmissao:
      erroPeriodo?.campo === "emissao" ? erroPeriodo.mensagem : undefined,
    alterarFiltro: <K extends keyof FiltrosContas>(
      campo: K,
      valor: FiltrosContas[K],
    ) => setFiltros((atual) => ({ ...atual, [campo]: valor })),
    carregando: !atual,
    erro: atual?.erro,
    recarregar,
    page: consulta.page,
    total: atual?.lista?.meta.total ?? 0,
    hasNextPage: atual?.lista?.meta.hasNextPage ?? false,
    mudarPagina: (page: number) => setConsulta((atual) => ({ ...atual, page })),
    linhas,
  };
};
export type ContasViewModel = ReturnType<typeof useContasViewModel>;
