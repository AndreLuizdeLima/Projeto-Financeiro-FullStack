import type { CardInfoIconProps } from "@/components/CardInfoIcon";
import { formatarMoeda } from "@/lib/utils";
import { Banknote, TrendingDown, TrendingUp } from "lucide-react";
import { useMemo } from "react";

export const useCardsViewModel = () => {
  const cardsBuild = useMemo<CardInfoIconProps[]>(
    () => [
      {
        title: "Receitas",
        value: formatarMoeda(1807),
        color: "green",
        icon: <TrendingUp />,
        loading: false,
      },
      {
        title: "Despesas",
        value: formatarMoeda(570),
        color: "red",
        icon: <TrendingDown />,
        loading: false,
      },
      {
        title: "Saldo atual",
        value: formatarMoeda(1237),
        color: "blue",
        icon: <Banknote />,
        loading: false,
      },
    ],
    [],
  );

  return { cardsBuild };
};
