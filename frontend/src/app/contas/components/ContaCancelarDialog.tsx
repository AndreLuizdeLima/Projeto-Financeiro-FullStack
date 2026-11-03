import { Dialog } from "@base-ui/react/dialog";
import { Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { formatarValor } from "../model/contas";
import type { ConfirmacaoCancelamento } from "../view-model/useContaCancelamentoViewModel";

type Props = {
  confirmacao: ConfirmacaoCancelamento;
  cancelando: boolean;
  fechar: () => void;
  confirmar: () => Promise<void>;
};

export const ContaCancelarDialog = ({
  confirmacao,
  cancelando,
  fechar,
  confirmar,
}: Props) => (
  <Dialog.Root
    open
    onOpenChange={(open) => {
      if (!open && !cancelando) fechar();
    }}
  >
    <Dialog.Portal>
      <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/40" />
      <Dialog.Popup
        finalFocus={() =>
          confirmacao.focoRetorno.isConnected
            ? confirmacao.focoRetorno
            : document.getElementById("adicionar-conta")
        }
        className="fixed top-1/2 left-1/2 z-50 max-h-[90svh] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl border bg-popover p-6 text-popover-foreground shadow-lg"
        aria-busy={cancelando}
      >
        <Dialog.Title className="text-lg font-semibold">
          Cancelar conta
        </Dialog.Title>
        <Dialog.Description className="mt-2 text-sm text-muted-foreground">
          A conta será marcada como cancelada. O registro e seu histórico serão
          preservados.
        </Dialog.Description>
        <div className="mt-4 flex flex-col gap-1 rounded-lg border bg-muted/30 p-3">
          <span className="font-medium wrap-break-word">
            {confirmacao.conta.descricao}
          </span>
          <span className="text-sm tabular-nums">
            {formatarValor(confirmacao.conta.valorOriginal)}
          </span>
        </div>
        {confirmacao.erro && (
          <p role="alert" className="mt-4 text-sm text-destructive">
            {confirmacao.erro}
          </p>
        )}
        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={cancelando}
            onClick={fechar}
          >
            Voltar
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={cancelando || confirmacao.bloqueada}
            onClick={() => void confirmar()}
          >
            {cancelando ? <Spinner /> : <Trash />}
            {cancelando ? "Cancelando…" : "Confirmar cancelamento"}
          </Button>
        </div>
      </Dialog.Popup>
    </Dialog.Portal>
  </Dialog.Root>
);
