import { Campo } from "@/app/cadastros/view/Campo";
import { Button } from "@/components/ui/button";

import {
  useFormaRecebimentoFormularioViewModel,
  type Props,
} from "../view-model/useFormaRecebimentoFormularioViewModel";
export const FormaRecebimentoFormulario = (props: Props) => {
  const vm = useFormaRecebimentoFormularioViewModel(props);

  return (
    <form
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

      {!vm.somenteLeitura && (
        <Button type="submit" disabled={props.ocupado}>
          {props.ocupado ? "Salvando…" : "Salvar"}
        </Button>
      )}
    </form>
  );
};
