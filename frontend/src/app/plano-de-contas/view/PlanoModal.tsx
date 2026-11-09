import type { ReactNode } from "react";
import { Dialog } from "@base-ui/react/dialog";
import { Button } from "@/components/ui/button";

export function PlanoModal({
  titulo,
  descricao,
  ocupado,
  fechar,
  children,
  exibirFechar = true,
}: {
  titulo: string;
  descricao: string;
  ocupado: boolean;
  fechar: () => void;
  children: ReactNode;
  exibirFechar?: boolean;
}) {
  return (
    <Dialog.Root
      open
      onOpenChange={(open) => {
        if (!open && !ocupado) fechar();
      }}
    >
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/40" />
        <Dialog.Popup className="fixed top-1/2 left-1/2 z-50 max-h-[90svh] w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl border bg-popover p-6 shadow-lg">
          <Dialog.Title className="text-lg font-semibold">
            {titulo}
          </Dialog.Title>
          <Dialog.Description className="mt-1 text-sm text-muted-foreground">
            {descricao}
          </Dialog.Description>
          <div className="mt-5">{children}</div>
          {exibirFechar && (
            <div className="mt-4 flex justify-end">
              <Button variant="outline" disabled={ocupado} onClick={fechar}>
                Fechar
              </Button>
            </div>
          )}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
