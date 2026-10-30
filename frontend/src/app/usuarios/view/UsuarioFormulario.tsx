import { Campo } from "@/app/cadastros/view/Campo";
import { Button } from "@/components/ui/button";

import {
  useUsuarioFormularioViewModel,
  type Props,
} from "../view-model/useUsuarioFormularioViewModel";
export const UsuarioFormulario = (props: Props) => {
  const vm = useUsuarioFormularioViewModel(props);

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
        maxLength={100}
      />
      <Campo
        label="E-mail"
        type="email"
        value={vm.valores.email}
        onChange={(event) => vm.alterar("email", event.target.value)}
        erro={vm.erros.email}
        readOnly={vm.somenteLeitura}
        disabled={props.ocupado}
      />
      {!vm.somenteLeitura && (
        <Campo
          label="Senha"
          type="password"
          value={vm.valores.password}
          onChange={(event) => vm.alterar("password", event.target.value)}
          erro={vm.erros.password}
          readOnly={vm.somenteLeitura}
          disabled={props.ocupado}
          autoComplete="new-password"
        />
      )}
      {!vm.somenteLeitura && (
        <Campo
          label="Confirme a senha"
          type="password"
          value={vm.valores.confirmacao}
          onChange={(event) => vm.alterar("confirmacao", event.target.value)}
          erro={vm.erros.confirmacao}
          readOnly={vm.somenteLeitura}
          disabled={props.ocupado}
          autoComplete="new-password"
        />
      )}
      {props.modo === "editar" && (
        <span className="text-xs text-muted-foreground">
          Deixe a senha vazia para manter a atual.
        </span>
      )}
      {!vm.somenteLeitura && (
        <Button type="submit" disabled={props.ocupado}>
          {props.ocupado ? "Salvando…" : "Salvar"}
        </Button>
      )}
    </form>
  );
};
