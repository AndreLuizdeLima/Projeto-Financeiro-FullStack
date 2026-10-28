import { readJson } from "@/lib/http";

export interface DashboardMensal {
  receita: number;
  despesas: number;
  saldo: number;
}

type Request = (path: string, init?: RequestInit) => Promise<Response>;

export interface EvolucaoSaldoMensal {
  mes: string;
  saldoInicial: number;
  evolucao: {
    semana: number;
    dataInicial: string;
    dataFinal: string;
    saldo: number;
  }[];
}

export const buscarEvolucaoSaldo = async (
  request: Request,
  mes: string,
  signal: AbortSignal,
): Promise<EvolucaoSaldoMensal> => {
  const params = new URLSearchParams({ mes });
  const response = await request(`/dashboard/evolucao-saldo?${params}`, {
    signal,
  });
  const dados = await readJson<EvolucaoSaldoMensal>(response);
  if (
    dados.mes !== mes ||
    typeof dados.saldoInicial !== "number" ||
    !Number.isFinite(dados.saldoInicial) ||
    !Array.isArray(dados.evolucao) ||
    !dados.evolucao.every(
      (item) =>
        item &&
        Number.isInteger(item.semana) &&
        typeof item.dataInicial === "string" &&
        typeof item.dataFinal === "string" &&
        typeof item.saldo === "number" &&
        Number.isFinite(item.saldo),
    )
  ) {
    throw new Error("Resposta inválida do servidor.");
  }
  return dados;
};

export const buscarDashboard = async (
  request: Request,
  mes: string,
  signal: AbortSignal,
): Promise<DashboardMensal> => {
  const params = new URLSearchParams({ mes });
  const response = await request(`/dashboard?${params}`, { signal });
  const dados = await readJson<DashboardMensal>(response);
  if (
    ![dados.receita, dados.despesas, dados.saldo].every(
      (valor) => typeof valor === "number" && Number.isFinite(valor),
    )
  ) {
    throw new Error("Resposta inválida do servidor.");
  }
  return dados;
};
