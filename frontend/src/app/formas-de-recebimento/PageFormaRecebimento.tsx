import { CadastroView, type Coluna } from "@/app/cadastros/view/CadastroView";
import { type FormaRecebimento } from "./model/formas-de-recebimento";
import { useFormaRecebimentoViewModel } from "./view-model/useFormaRecebimentoViewModel";
import { FormaRecebimentoFormulario } from "./view/FormaRecebimentoFormulario";
const colunas: Coluna<FormaRecebimento>[] = [
  { titulo: "Nome", valor: (item) => item.nome },
];
const PageFormaRecebimento = () => {
  const vm = useFormaRecebimentoViewModel();
  return (
    <CadastroView
      titulo="Formas de recebimento"
      singular="Forma de recebimento"
      colunas={colunas}
      vm={vm}
      formulario={(props) => <FormaRecebimentoFormulario {...props} />}
    />
  );
};
export default PageFormaRecebimento;
