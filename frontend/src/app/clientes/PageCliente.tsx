import { CadastroView, type Coluna } from "@/app/cadastros/view/CadastroView";
import { type Cliente } from "./model/clientes";
import { useClienteViewModel } from "./view-model/useClienteViewModel";
import { ClienteFormulario } from "./view/ClienteFormulario";
const colunas: Coluna<Cliente>[] = [
  { titulo: "CNPJ", valor: (item) => item.cnpj },
  { titulo: "Razão social", valor: (item) => item.razaoSocial },
  { titulo: "Nome fantasia", valor: (item) => item.nomeFantasia },
];
const PageCliente = () => {
  const vm = useClienteViewModel();
  return (
    <CadastroView
      titulo="Clientes"
      singular="Cliente"
      colunas={colunas}
      vm={vm}
      formulario={(props) => <ClienteFormulario {...props} />}
    />
  );
};
export default PageCliente;
