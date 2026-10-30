import { CadastroView, type Coluna } from "@/app/cadastros/view/CadastroView";
import { type Usuario } from "./model/usuarios";
import { useUsuarioViewModel } from "./view-model/useUsuarioViewModel";
import { UsuarioFormulario } from "./view/UsuarioFormulario";
const colunas: Coluna<Usuario>[] = [
  { titulo: "Nome", valor: (item) => item.nome },
  { titulo: "E-mail", valor: (item) => item.email },
];
const PageUsuario = () => {
  const vm = useUsuarioViewModel();
  return (
    <CadastroView
      titulo="Usuários"
      singular="Usuário"
      colunas={colunas}
      vm={vm}
      formulario={(props) => <UsuarioFormulario {...props} />}
    />
  );
};
export default PageUsuario;
