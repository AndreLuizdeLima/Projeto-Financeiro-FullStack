import { Campo } from "@/app/cadastros/view/Campo";
import { Button } from "@/components/ui/button";

import {
  useClienteFormularioViewModel,
  type Props,
} from "../view-model/useClienteFormularioViewModel";
export const ClienteFormulario = (props: Props) => {
  const vm = useClienteFormularioViewModel(props);

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
        label="CNPJ"
        type="text"
        value={vm.valores.cnpj}
        onChange={(event) => vm.alterar("cnpj", event.target.value)}
        erro={vm.erros.cnpj}
        readOnly={vm.somenteLeitura}
        disabled={props.ocupado}
      />
      <Campo
        label="Razão social"
        type="text"
        value={vm.valores.razaoSocial}
        onChange={(event) => vm.alterar("razaoSocial", event.target.value)}
        erro={vm.erros.razaoSocial}
        readOnly={vm.somenteLeitura}
        disabled={props.ocupado}
        maxLength={100}
      />
      <Campo
        label="Nome fantasia"
        type="text"
        value={vm.valores.nomeFantasia}
        onChange={(event) => vm.alterar("nomeFantasia", event.target.value)}
        erro={vm.erros.nomeFantasia}
        readOnly={vm.somenteLeitura}
        disabled={props.ocupado}
        maxLength={100}
      />

      {!vm.somenteLeitura && (
        <Button type="submit" disabled={props.ocupado}>
          {props.ocupado ? "Salvando…" : "Salvar"}
        </Button>
      )}
    </form>
  );
};
