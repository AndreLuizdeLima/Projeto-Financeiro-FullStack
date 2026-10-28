import CardsView from "./view/CardsView";
import dayjs from "dayjs";
import "dayjs/locale/pt-br";
import { useEffect } from "react";
import { useSearchParams } from "react-router";

const PageDashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const parametroMes = searchParams.get("mes");
  const mes =
    parametroMes && /^(?!0000)\d{4}-(0[1-9]|1[0-2])$/.test(parametroMes)
      ? parametroMes
      : dayjs().format("YYYY-MM");

  useEffect(() => {
    if (parametroMes === mes) return;
    setSearchParams(
      (params) => {
        params.set("mes", mes);
        return params;
      },
      { replace: true },
    );
  }, [mes, parametroMes, setSearchParams]);

  const [ano, numeroMes] = mes.split("-").map(Number);
  const periodo = dayjs()
    .date(1)
    .year(ano)
    .month(numeroMes - 1)
    .locale("pt-br")
    .format("MMMM [de] YYYY");

  return (
    <article className="flex flex-col gap-4 p-2">
      <header className="flex flex-col gap-1 py-2">
        <h1 className="text-2xl font-semibold">Resumo financeiro</h1>
        <p className="text-sm text-muted-foreground">
          {periodo.charAt(0).toUpperCase() + periodo.slice(1)}
        </p>
      </header>
      <CardsView mes={mes} />
    </article>
  );
};

export default PageDashboard;
