import { Campo } from "@/app/cadastros/view/Campo";

import {
  useFormaRecebimentoFormularioViewModel,
  type Props,
} from "../view-model/useFormaRecebimentoFormularioViewModel";
export const FormaRecebimentoFormulario = (props: Props) => {
  const vm = useFormaRecebimentoFormularioViewModel(props);

  return (
    <form
      id={props.formularioId}
      noValidate
      className="flex flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        if (!props.ocupado) void vm.enviar();
      }}
    >
      <Campo
        label="Nome"
        type="text"
        value={vm.valores.nome}
        onChange={(event) => vm.alterar("nome", event.target.value)}
        erro={vm.erros.nome}
        readOnly={vm.somenteLeitura}
        disabled={props.ocupado}
      />


    </form>
  );
};
