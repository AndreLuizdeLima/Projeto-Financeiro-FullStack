import { readJson } from "@/lib/http";

export interface DashboardMensal {
  receita: number;
  despesas: number;
  saldo: number;
}

type Request = (path: string, init?: RequestInit) => Promise<Response>;

export async function buscarDashboard(
  request: Request,
  mes: string,
  signal: AbortSignal,
): Promise<DashboardMensal> {
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
}
