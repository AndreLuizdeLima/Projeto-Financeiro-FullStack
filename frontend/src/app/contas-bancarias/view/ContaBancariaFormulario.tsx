import { useId } from "react";
import { Campo } from "@/app/cadastros/view/Campo";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { tiposConta, type TipoConta } from "../model/contas-bancarias";
import {
  useContaBancariaFormularioViewModel,
  type Props,
} from "../view-model/useContaBancariaFormularioViewModel";
export const ContaBancariaFormulario = (props: Props) => {
  const vm = useContaBancariaFormularioViewModel(props);
  const tipoId = useId();
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
      <Campo
        label="Conta"
        type="text"
        value={vm.valores.conta}
        onChange={(event) => vm.alterar("conta", event.target.value)}
        erro={vm.erros.conta}
        readOnly={vm.somenteLeitura}
        disabled={props.ocupado}
      />
      <div className="flex flex-col gap-2">
        <Label htmlFor={tipoId}>Tipo</Label>
        <select
          id={tipoId}
          disabled={vm.somenteLeitura || props.ocupado}
          value={vm.valores.tipo}
          onChange={(event) =>
            vm.alterar("tipo", event.target.value as TipoConta)
          }
          aria-invalid={!!vm.erros.tipo}
          aria-describedby={vm.erros.tipo ? `${tipoId}-erro` : undefined}
          className="h-9 rounded-lg border bg-background px-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {Object.entries(tiposConta).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        {vm.erros.tipo && (
          <span
            id={`${tipoId}-erro`}
            role="alert"
            className="text-sm text-destructive"
          >
            {vm.erros.tipo}
          </span>
        )}
      </div>

      {!vm.somenteLeitura && (
        <Button type="submit" disabled={props.ocupado}>
          {props.ocupado ? "Salvando…" : "Salvar"}
        </Button>
      )}
    </form>
  );
};
