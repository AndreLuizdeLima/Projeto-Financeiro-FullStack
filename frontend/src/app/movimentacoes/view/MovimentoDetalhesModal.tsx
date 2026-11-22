import { Dialog } from "@base-ui/react/dialog";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import type { ContaBancaria } from "@/app/contas-bancarias/model/contas-bancarias";
import { useMovimentoDetalhesViewModel } from "../view-model/useMovimentacoesViewModel";

type Props = {
  id: number;
  focoRetorno: HTMLElement;
  bancos?: ContaBancaria[];
  fechar: () => void;
};
export const MovimentoDetalhesModal = ({
  id,
  focoRetorno,
  bancos,
  fechar,
}: Props) => {
  const vm = useMovimentoDetalhesViewModel(id, bancos);
  return (
    <Dialog.Root
      open
      onOpenChange={(open) => {
        if (!open) fechar();
      }}
    >
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/40" />
        <Dialog.Popup
          finalFocus={() =>
            focoRetorno.isConnected
              ? focoRetorno
              : document.getElementById("movimentacoes-periodo")
          }
          className="fixed top-1/2 left-1/2 z-50 flex max-h-[90svh] w-[calc(100%-2rem)] max-w-3xl -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-xl border bg-popover text-popover-foreground shadow-lg"
        >
          <header className="flex items-center justify-between gap-4 border-b p-5">
            <Dialog.Title className="text-xl font-semibold">
              Movimentação #{id}
            </Dialog.Title>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Fechar detalhes"
              onClick={fechar}
            >
              <X />
            </Button>
          </header>
          <div
            className="min-h-0 overflow-y-auto p-5"
            aria-busy={vm.carregando}
          >
            {vm.carregando ? (
              <div
                role="status"
                className="flex items-center justify-center gap-2 py-12"
              >
                <Spinner />
                Carregando detalhes…
              </div>
            ) : vm.erro ? (
              <div role="alert" className="flex flex-col items-start gap-3">
                <span>{vm.erro}</span>
                <Button variant="outline" onClick={vm.recarregar}>
                  Tentar novamente
                </Button>
              </div>
            ) : (
              <dl className="grid gap-5 sm:grid-cols-2">
                {vm.campos.map(([label, valor]) => (
                  <div key={label} className="min-w-0">
                    <dt className="text-sm text-muted-foreground">{label}</dt>
                    <dd className="mt-1 wrap-break-word font-medium">
                      {valor}
                    </dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
