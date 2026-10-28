import { useEffect, useState } from "react";
import { useAuth } from "@/auth/useAuth";
import {
  buscarEvolucaoSaldo,
  type EvolucaoSaldoMensal,
} from "../model/dashboard";

export const useEvolucaoSaldoViewModel = (mes: string) => {
  const { request } = useAuth();
  const [resultado, setResultado] = useState<{
    mes: string;
    dados?: EvolucaoSaldoMensal;
    error?: string;
  } | null>(null);
  const atual = resultado?.mes === mes ? resultado : null;

  useEffect(() => {
    const controller = new AbortController();
    buscarEvolucaoSaldo(request, mes, controller.signal)
      .then((dados) => {
        if (!controller.signal.aborted) setResultado({ mes, dados });
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setResultado({
            mes,
            error:
              "Não foi possível carregar a evolução do saldo. Tente novamente mais tarde.",
          });
        }
      });
    return () => controller.abort();
  }, [mes, request]);

  return { dados: atual?.dados, error: atual?.error, loading: atual === null };
};
