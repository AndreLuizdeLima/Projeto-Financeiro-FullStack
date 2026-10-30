import { CadastroView, type Coluna } from "@/app/cadastros/view/CadastroView";
import { tiposConta, type ContaBancaria } from "./model/contas-bancarias";
import { useContaBancariaViewModel } from "./view-model/useContaBancariaViewModel";
import { ContaBancariaFormulario } from "./view/ContaBancariaFormulario";
const colunas: Coluna<ContaBancaria>[] = [
  { titulo: "Nome", valor: (item) => item.nome },
  { titulo: "Conta", valor: (item) => item.conta },
  { titulo: "Tipo", valor: (item) => tiposConta[item.tipo] },
];
const PageContaBancaria = () => {
  const vm = useContaBancariaViewModel();
  return (
    <CadastroView
      titulo="Contas bancárias"
      singular="Conta bancária"
      colunas={colunas}
      vm={vm}
      formulario={(props) => <ContaBancariaFormulario {...props} />}
    />
  );
};
export default PageContaBancaria;
