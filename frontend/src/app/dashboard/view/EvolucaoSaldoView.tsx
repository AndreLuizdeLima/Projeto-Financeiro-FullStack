import { useEffect, useRef } from "react";
import { init, use as registerECharts } from "echarts/core";
import { LineChart } from "echarts/charts";
import { GridComponent, TooltipComponent } from "echarts/components";
import { SVGRenderer } from "echarts/renderers";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { formatarMoeda } from "@/lib/utils";
import type { EvolucaoSaldoMensal } from "../model/dashboard";
import { useEvolucaoSaldoViewModel } from "../view-model/useEvolucaoSaldoViewModel";

registerECharts([LineChart, GridComponent, TooltipComponent, SVGRenderer]);

const dataCurta = (data: string) => `${data.slice(8, 10)}/${data.slice(5, 7)}`;

const GraficoSaldo = ({ dados }: { dados: EvolucaoSaldoMensal }) => {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current) return;
    const chart = init(container.current, null, { renderer: "svg" });
    const pontos = [
      { periodo: "Saldo inicial", saldo: dados.saldoInicial },
      ...dados.evolucao.map((item) => ({
        periodo: `${dataCurta(item.dataInicial)} – ${dataCurta(item.dataFinal)}`,
        saldo: item.saldo,
      })),
    ];
    chart.setOption({
      color: ["#2563eb"],
      grid: { left: 16, right: 24, top: 24, bottom: 16, containLabel: true },
      tooltip: {
        trigger: "axis",
        renderMode: "richText",
        valueFormatter: (value: number) => formatarMoeda(value),
      },
      xAxis: {
        type: "category",
        boundaryGap: false,
        data: pontos.map((ponto) => ponto.periodo),
        axisLabel: { color: "#64748b", hideOverlap: true },
        axisLine: { lineStyle: { color: "#cbd5e1" } },
        axisTick: { show: false },
      },
      yAxis: {
        type: "value",
        axisLabel: {
          color: "#64748b",
          formatter: (value: number) => formatarMoeda(value),
        },
        splitLine: { lineStyle: { color: "#e2e8f0", type: "dashed" } },
      },
      series: [
        {
          name: "Saldo acumulado",
          type: "line",
          data: pontos.map((ponto) => ponto.saldo),
          symbolSize: 8,
          lineStyle: { width: 3 },
          areaStyle: { opacity: 0.08 },
        },
      ],
    });
    const observer = new ResizeObserver(() => chart.resize());
    observer.observe(container.current);
    return () => {
      observer.disconnect();
      chart.dispose();
    };
  }, [dados]);

  return (
    <>
      <div
        ref={container}
        className="h-80 w-full"
        role="img"
        aria-label="Gráfico de evolução do saldo acumulado por período"
      />
      <table className="sr-only">
        <thead>
          <tr>
            <th scope="col">Período</th>
            <th scope="col">Saldo</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th scope="row">Saldo inicial</th>
            <td>{formatarMoeda(dados.saldoInicial)}</td>
          </tr>
          {dados.evolucao.map((item) => (
            <tr key={item.semana}>
              <th scope="row">
                {dataCurta(item.dataInicial)} a {dataCurta(item.dataFinal)}
              </th>
              <td>{formatarMoeda(item.saldo)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
};

const EvolucaoSaldoView = ({ mes }: { mes: string }) => {
  const { dados, error, loading } = useEvolucaoSaldoViewModel(mes);

  return (
    <Card className="min-w-0">
      <CardHeader>
        <CardTitle>
          <h2>Evolução do saldo</h2>
        </CardTitle>
        <CardDescription>
          Saldo acumulado ao longo do mês, incluindo o saldo inicial.
        </CardDescription>
      </CardHeader>
      <CardContent aria-busy={loading}>
        {loading ? (
          <div
            role="status"
            className="flex h-80 items-center justify-center gap-2 text-muted-foreground"
          >
            <Spinner aria-hidden="true" /> Carregando evolução do saldo…
          </div>
        ) : error ? (
          <p role="alert" className="py-8 text-sm text-destructive">
            {error}
          </p>
        ) : dados && dados.evolucao.length > 0 ? (
          <GraficoSaldo dados={dados} />
        ) : (
          <p className="py-8 text-sm text-muted-foreground">
            Não há evolução de saldo disponível para este mês.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default EvolucaoSaldoView;
