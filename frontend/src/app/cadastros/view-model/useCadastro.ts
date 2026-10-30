import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/auth/useAuth";
import { toast } from "@/components/ui/toast";
import type { CadastroApi, Pagina, Registro, Modo } from "../model/cadastro";

export type Politica<T, U> = {
  nome: (item: T) => string;
  podeEditar: (item: T) => boolean;
  reativacao?: (item: T) => U;
};
const mensagem = (error: unknown) =>
  error instanceof Error
    ? error.message
    : "Não foi possível concluir a solicitação.";

export const useCadastro = <T extends Registro, C, U>(
  api: CadastroApi<T, C, U>,
  politica: Politica<T, U>,
) => {
  const { request, getGeneration } = useAuth();
  const [consulta, setConsulta] = useState({ page: 1, revisao: 0 });
  const [lista, setLista] = useState<{
    chave: typeof consulta;
    dados?: Pagina<T>;
    erro?: string;
  }>();
  const [modal, setModal] = useState<{
    modo: Modo;
    registro?: T;
    erro?: string;
    carregando: boolean;
  } | null>(null);
  const [confirmacao, setConfirmacao] = useState<T | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const [erroAcao, setErroAcao] = useState("");
  const bloqueio = useRef(false);
  const detalhe = useRef<AbortController | null>(null);
  const montado = useRef(true);
  useEffect(() => {
    montado.current = true;
    return () => {
      montado.current = false;
      detalhe.current?.abort();
    };
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    api
      .listar(request, consulta.page, controller.signal)
      .then((dados) => {
        if (!controller.signal.aborted) setLista({ chave: consulta, dados });
      })
      .catch((error) => {
        if (!controller.signal.aborted)
          setLista({ chave: consulta, erro: mensagem(error) });
      });
    return () => controller.abort();
  }, [api, request, consulta]);
  const recarregar = useCallback(
    (page?: number) =>
      setConsulta((atual) => ({
        page: page ?? atual.page,
        revisao: atual.revisao + 1,
      })),
    [],
  );
  const abrir = async (modo: Modo, item?: T) => {
    if (bloqueio.current) return;
    detalhe.current?.abort();
    setErroAcao("");
    if (!item) {
      setModal({ modo, carregando: false });
      return;
    }
    const controller = new AbortController();
    detalhe.current = controller;
    setModal({ modo, carregando: true });
    try {
      const registro = await api.consultar(request, item.id, controller.signal);
      if (!controller.signal.aborted)
        setModal({
          modo:
            modo === "editar" && !politica.podeEditar(registro)
              ? "consultar"
              : modo,
          registro,
          carregando: false,
        });
    } catch (error) {
      if (!controller.signal.aborted)
        setModal({
          modo,
          registro: item,
          erro: mensagem(error),
          carregando: false,
        });
    }
  };
  const fechar = () => {
    if (bloqueio.current) return;
    detalhe.current?.abort();
    setModal(null);
    setConfirmacao(null);
    setErroAcao("");
  };
  const executar = async (
    acao: () => Promise<T>,
    sucesso: string,
    apos: () => void,
  ) => {
    if (bloqueio.current) return false;
    bloqueio.current = true;
    setOcupado(true);
    setErroAcao("");
    const geracao = getGeneration();
    try {
      await acao();
      if (!montado.current || geracao !== getGeneration()) return false;
      toast.add({ type: "success", title: sucesso });
      apos();
      return true;
    } catch (error) {
      if (montado.current && geracao === getGeneration())
        setErroAcao(mensagem(error));
      return false;
    } finally {
      bloqueio.current = false;
      if (montado.current) setOcupado(false);
    }
  };
  const salvar = (payload: C | U) => {
    if (!modal || modal.modo === "consultar" || modal.carregando || modal.erro)
      return Promise.resolve(false);
    const criar = modal.modo === "criar";
    const registro = modal.registro;
    if (!criar && (!registro || !politica.podeEditar(registro)))
      return Promise.resolve(false);
    return executar(
      () =>
        criar
          ? api.criar(request, payload as C)
          : api.atualizar(request, registro!.id, payload as U),
      "Cadastro salvo.",
      () => {
        recarregar(criar ? 1 : undefined);
        setModal(null);
      },
    );
  };
  const inativar = () =>
    confirmacao &&
    executar(
      () => api.inativar(request, confirmacao.id),
      "Cadastro inativado.",
      () => {
        setConfirmacao(null);
        recarregar();
      },
    );
  const reativar = (item: T) => {
    if (!politica.reativacao) return;
    void executar(
      () => api.atualizar(request, item.id, politica.reativacao!(item)),
      "Cadastro reativado.",
      () => recarregar(),
    );
  };
  const atual = lista?.chave === consulta ? lista : undefined;
  return {
    dados: atual?.dados,
    erro: atual?.erro,
    carregando: !atual,
    page: consulta.page,
    mudarPagina: (page: number) => recarregar(page),
    recarregar,
    modal,
    abrir,
    fechar,
    salvar,
    confirmacao,
    confirmarInativacao: (item: T) => {
      setErroAcao("");
      setConfirmacao(item);
    },
    inativar,
    reativar,
    ocupado,
    erroAcao,
    politica,
  };
};
