import { useId } from "react";
import { Combobox } from "@base-ui/react/combobox";
import { Check, ChevronDown, X } from "lucide-react";
import { Label } from "@/components/ui/label";

type Opcao = { id: number; label: string; isActive: boolean };
type Props = {
  label: string;
  opcoes: Opcao[];
  value: number | null;
  onValueChange: (id: number | null) => void;
  disabled?: boolean;
  erro?: string;
  opcional?: boolean;
};

export const SeletorPesquisavel = ({
  label,
  opcoes,
  value,
  onValueChange,
  disabled,
  erro,
  opcional,
}: Props) => {
  const id = useId();
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Combobox.Root
        items={opcoes}
        value={opcoes.find((o) => o.id === value) ?? null}
        onValueChange={(opcao) => onValueChange(opcao?.id ?? null)}
        itemToStringLabel={(opcao) => opcao.label}
        isItemEqualToValue={(a, b) => a.id === b.id}
        disabled={disabled}
      >
        <div className="relative">
          <Combobox.Input
            id={id}
            placeholder={
              opcional ? "Nenhum · pesquisar…" : "Pesquisar e selecionar…"
            }
            aria-invalid={!!erro}
            aria-describedby={erro ? `${id}-erro` : undefined}
            className="h-8 w-full min-w-0 rounded-lg border border-input bg-background py-1 pr-14 pl-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50 aria-invalid:border-destructive"
          />
          <div className="absolute inset-y-0 right-1 flex items-center">
            {opcional && (
              <Combobox.Clear
                aria-label={`Remover ${label.toLowerCase()}`}
                className="rounded p-1 text-muted-foreground hover:bg-muted"
              >
                <X className="size-3.5" />
              </Combobox.Clear>
            )}
            <Combobox.Trigger
              aria-label={`Exibir opções de ${label.toLowerCase()}`}
              className="rounded p-1 text-muted-foreground hover:bg-muted"
            >
              <ChevronDown className="size-4" />
            </Combobox.Trigger>
          </div>
        </div>
        <Combobox.Portal>
          <Combobox.Positioner sideOffset={4} align="start" className="z-[60]">
            <Combobox.Popup className="max-h-[min(20rem,var(--available-height))] w-(--anchor-width) max-w-[calc(100vw-2rem)] overflow-y-auto rounded-lg border bg-popover p-1 text-popover-foreground shadow-md">
              <Combobox.Empty className="text-sm text-muted-foreground">
                <span className="block px-3 py-4">
                  Nenhum cadastro encontrado.
                </span>
              </Combobox.Empty>
              <Combobox.List>
                {(opcao: Opcao) => (
                  <Combobox.Item
                    key={opcao.id}
                    value={opcao}
                    disabled={!opcao.isActive}
                    className="relative flex cursor-default items-center rounded-md py-2 pr-8 pl-2 text-sm outline-none data-highlighted:bg-primary data-highlighted:text-primary-foreground data-selected:bg-primary data-selected:text-primary-foreground data-disabled:opacity-50"
                  >
                    <span className="min-w-0 wrap-break-word">
                      {opcao.label}
                    </span>
                    <Combobox.ItemIndicator className="absolute right-2">
                      <Check className="size-4" />
                    </Combobox.ItemIndicator>
                  </Combobox.Item>
                )}
              </Combobox.List>
            </Combobox.Popup>
          </Combobox.Positioner>
        </Combobox.Portal>
      </Combobox.Root>
      {erro && (
        <span
          id={`${id}-erro`}
          role="alert"
          className="text-sm text-destructive"
        >
          {erro}
        </span>
      )}
    </div>
  );
};
