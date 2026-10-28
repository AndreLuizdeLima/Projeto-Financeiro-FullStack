import type { CardInfoIconProps } from "@/components/CardInfoIcon";
import { formatarMoeda } from "@/lib/utils";
import { Banknote, TrendingDown, TrendingUp } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/auth/useAuth";
import { buscarDashboard, type DashboardMensal } from "../model/dashboard";

export const useCardsViewModel = (mes: string) => {
  const { request } = useAuth();
  const [resultado, setResultado] = useState<{
    mes: string;
    dados?: DashboardMensal;
    error?: string;
  } | null>(null);
  const atual = resultado?.mes === mes ? resultado : null;
  const loading = atual === null;
  const dados = atual?.dados;

  useEffect(() => {
    const controller = new AbortController();
    buscarDashboard(request, mes, controller.signal)
      .then((dados) => {
        if (!controller.signal.aborted) setResultado({ mes, dados });
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setResultado({
            mes,
            error: "Não foi possível carregar os dados do mês. Tente novamente mais tarde.",
          });
        }
      });
    return () => controller.abort();
  }, [mes, request]);

  const cardsBuild = useMemo<CardInfoIconProps[]>(
    () => [
      {
        title: "Receitas",
        value: dados ? formatarMoeda(dados.receita) : "—",
        color: "green",
        icon: <TrendingUp />,
        loading,
      },
      {
        title: "Despesas",
        value: dados ? formatarMoeda(dados.despesas) : "—",
        color: "red",
        icon: <TrendingDown />,
        loading,
      },
      {
        title: "Saldo do mês",
        value: dados ? formatarMoeda(dados.saldo) : "—",
        color: "blue",
        icon: <Banknote />,
        loading,
      },
    ],
    [dados, loading],
  );

  return { cardsBuild, error: atual?.error };
};
