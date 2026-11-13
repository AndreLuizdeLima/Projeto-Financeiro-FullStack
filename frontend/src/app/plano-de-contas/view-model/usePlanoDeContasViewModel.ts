import { useEffect, useMemo, useRef, useState } from "react";
import debounce from "lodash/debounce";
import { useAuth } from "@/auth/useAuth";
import { toast } from "@/components/ui/toast";
import {
  carregarPlanos,
  consultarPlano,
  gravarPlano,
  type Plano,
  type CriarPlano,
  type EditarPlano,
} from "../model/plano-de-contas";
import {
  filtrarHierarquia,
  montarHierarquia,
  type NoPlano,
} from "../model/hierarquia";

type Modal = {
  modo: "criar" | "editar" | "consultar";
  conta?: Plano;
  paiId?: number;
  carregando?: boolean;
  erro?: string;
};
const mensagem = (e: unknown) =>
  e instanceof Error ? e.message : "Não foi possível concluir a solicitação.";
export function usePlanoDeContasViewModel() {
  const { request, getGeneration } = useAuth();
  const [revisao, setRevisao] = useState(0);
  const [lista, setLista] = useState<{
    revisao: number;
    contas?: Plano[];
    erro?: string;
  }>();
  const [busca, setBusca] = useState("");
  const [termo, setTermo] = useState("");
  const [tipo, setTipo] = useState("todos");
  const [situacao, setSituacao] = useState("todos");
  const [expandidos, setExpandidos] = useState<Set<number>>(new Set());
  const [modal, setModal] = useState<Modal | null>(null);
  const [confirmacao, setConfirmacao] = useState<Plano | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const [erroAcao, setErroAcao] = useState("");
  const [aposGravacao, setAposGravacao] = useState(false);
  const [revelar, setRevelar] = useState<string>();
  const bloqueio = useRef(false),
    montado = useRef(true);
  const detalhe = useRef<AbortController | null>(null);
  const atualizarTermo = useMemo(() => debounce(setTermo, 400), []);
  useEffect(() => () => atualizarTermo.cancel(), [atualizarTermo]);
  useEffect(() => {
    montado.current = true;
    return () => {
      montado.current = false;
      detalhe.current?.abort();
    };
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    const geracao = getGeneration();
    carregarPlanos(request, controller.signal)
      .then((contas) => {
        if (!controller.signal.aborted && geracao === getGeneration())
          setLista({ revisao, contas });
      })
      .catch((e) => {
        if (!controller.signal.aborted && geracao === getGeneration())
          setLista({ revisao, erro: mensagem(e) });
      });
    return () => controller.abort();
  }, [request, getGeneration, revisao]);
  const atual = lista?.revisao === revisao ? lista : undefined;
  const arvore = useMemo(
    () => montarHierarquia(atual?.contas ?? []),
    [atual?.contas],
  );
  const expansao = useMemo(() => {
    const ids = new Set(expandidos);
    if (revelar)
      for (const no of arvore.nos)
        if (revelar.startsWith(`${no.conta.codigo}.`)) ids.add(no.conta.id);
    return ids;
  }, [expandidos, revelar, arvore]);
  const resultado = useMemo(
    () =>
      filtrarHierarquia(
        arvore.nos,
        { busca: termo, tipo, situacao },
        expansao,
        revelar,
      ),
    [arvore, termo, tipo, situacao, expansao, revelar],
  );
  const pais = arvore.nos.filter((n) => n.valido && n.nivel < 10);
  const recarregar = () => setRevisao((r) => r + 1);
  const abrir = async (modo: Modal["modo"], conta?: Plano, paiId?: number) => {
    if (bloqueio.current) return;
    detalhe.current?.abort();
    setErroAcao("");
    if (modo === "criar") {
      setModal({ modo, paiId });
      return;
    }
    if (!conta) return;
    const controller = new AbortController();
    const geracao = getGeneration();
    detalhe.current = controller;
    setModal({ modo, conta, carregando: true });
    try {
      const registro = await consultarPlano(
        request,
        conta.id,
        controller.signal,
      );
      if (!controller.signal.aborted && geracao === getGeneration())
        setModal({ modo, conta: registro });
    } catch (e) {
      if (!controller.signal.aborted && geracao === getGeneration())
        setModal({ modo, conta, erro: mensagem(e) });
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
    acao: () => Promise<Plano>,
    titulo: string,
    criar = false,
  ) => {
    if (bloqueio.current) return false;
    bloqueio.current = true;
    setOcupado(true);
    setErroAcao("");
    const geracao = getGeneration();
    try {
      const conta = await acao();
      if (!montado.current || geracao !== getGeneration()) return false;
      if (criar) {
        setRevelar(conta.codigo);
      }
      toast.add({ type: "success", title: titulo });
      setModal(null);
      setConfirmacao(null);
      setAposGravacao(true);
      recarregar();
      return true;
    } catch (e) {
      if (montado.current && geracao === getGeneration())
        setErroAcao(mensagem(e));
      return false;
    } finally {
      bloqueio.current = false;
      if (montado.current) setOcupado(false);
    }
  };
  const salvar = (payload: CriarPlano | EditarPlano) => {
    if (!modal || modal.carregando || modal.erro || modal.modo === "consultar")
      return Promise.resolve(false);
    const criar = modal.modo === "criar";
    return executar(
      () =>
        gravarPlano(
          request,
          criar ? "POST" : "PATCH",
          payload,
          criar ? undefined : modal.conta!.id,
        ),
      "Conta salva.",
      criar,
    );
  };
  const mudarExpansao = (ids: Set<number>) => {
    setRevelar(undefined);
    setExpandidos(ids);
  };
  const ramos = arvore.nos.filter((no) => no.filhos.length > 0);
  const tudoExpandido =
    ramos.length > 0 &&
    (resultado.filtrando || ramos.every((no) => expansao.has(no.conta.id)));
  const alternar = (no: NoPlano) => {
    const ids = new Set(expansao);
    if (ids.has(no.conta.id)) ids.delete(no.conta.id);
    else ids.add(no.conta.id);
    mudarExpansao(ids);
  };
  return {
    ...resultado,
    arvore,
    pais,
    busca,
    tipo,
    situacao,
    modal,
    confirmacao,
    ocupado,
    erroAcao,
    aposGravacao,
    erro: atual?.erro,
    carregando: !atual,
    expansao,
    codigoRevelado: revelar,
    alterarBusca: (valor: string) => {
      setRevelar(undefined);
      setBusca(valor);
      atualizarTermo(valor);
    },
    setTipo: (valor: string) => {
      setRevelar(undefined);
      setTipo(valor);
    },
    setSituacao: (valor: string) => {
      setRevelar(undefined);
      setSituacao(valor);
    },
    recarregar,
    abrir,
    fechar,
    salvar,
    alternar,
    tudoExpandido,
    podeAlternarTudo:
      !!atual?.contas &&
      !atual.erro &&
      !resultado.filtrando &&
      ramos.length > 0,
    alternarTudo: () =>
      mudarExpansao(
        tudoExpandido ? new Set() : new Set(ramos.map((no) => no.conta.id)),
      ),
    confirmar: (conta: Plano) => {
      if (!bloqueio.current) {
        setErroAcao("");
        setConfirmacao(conta);
      }
    },
    inativar: () =>
      confirmacao &&
      executar(
        () => gravarPlano(request, "DELETE", undefined, confirmacao.id),
        "Conta inativada.",
      ),
    reativar: (conta: Plano) =>
      executar(
        () => gravarPlano(request, "PATCH", { isActive: true }, conta.id),
        "Conta reativada.",
      ),
  };
}
export type PlanoDeContasVM = ReturnType<typeof usePlanoDeContasViewModel>;
