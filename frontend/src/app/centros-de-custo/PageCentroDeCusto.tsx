import { CadastroView, type Coluna } from "@/app/cadastros/view/CadastroView";
import { type CentroDeCusto } from "./model/centros-de-custo";
import { useCentroDeCustoViewModel } from "./view-model/useCentroDeCustoViewModel";
import { CentroDeCustoFormulario } from "./view/CentroDeCustoFormulario";
const colunas: Coluna<CentroDeCusto>[] = [
  { titulo: "Nome", valor: (item) => item.nome },
];
const PageCentroDeCusto = () => {
  const vm = useCentroDeCustoViewModel();
  return (
    <CadastroView
      titulo="Centros de custo"
      singular="Centro de custo"
      colunas={colunas}
      vm={vm}
      formulario={(props) => <CentroDeCustoFormulario {...props} />}
    />
  );
};
export default PageCentroDeCusto;
