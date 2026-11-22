import { Dialog } from "@base-ui/react/dialog";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Campo } from "@/app/cadastros/view/Campo";
import { CampoData } from "@/components/ui/campo-data";
import { SeletorPesquisavel } from "@/components/ui/seletor-pesquisavel";
import {
  useLancamentoViewModel,
  type LancamentoProps,
} from "../view-model/useLancamentoViewModel";

export const LancamentoModal = (props: LancamentoProps) => {
  const vm = useLancamentoViewModel(props);
  return (
    <Dialog.Root
      open
      onOpenChange={(open) => {
        if (!open) vm.fechar();
      }}
    >
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/40" />
        <Dialog.Popup
          finalFocus={() =>
            props.focoRetorno.isConnected
              ? props.focoRetorno
              : document.getElementById("lancar-movimentacao")
          }
          className="fixed top-1/2 left-1/2 z-50 flex max-h-[90svh] w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-xl border bg-popover text-popover-foreground shadow-lg"
        >
          <header className="flex items-center justify-between gap-4 border-b p-5">
            <Dialog.Title className="text-xl font-semibold">
              {vm.titulo}
            </Dialog.Title>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Fechar lançamento"
              disabled={vm.salvando}
              onClick={vm.fechar}
            >
              <X />
            </Button>
          </header>
          <form
            noValidate
            className="flex min-h-0 flex-col"
            aria-busy={vm.carregando || vm.salvando}
            onSubmit={(e) => {
              e.preventDefault();
              void vm.enviar();
            }}
          >
            <div className="min-h-0 overflow-y-auto p-5">
              {vm.carregando ? (
                <div
                  role="status"
                  className="flex items-center justify-center gap-2 py-10"
                >
                  <Spinner />
                  Carregando contas bancárias…
                </div>
              ) : vm.erroCarga ? (
                <div role="alert" className="flex flex-col items-start gap-3">
                  <span>{vm.erroCarga}</span>
                  <Button
                    variant="outline"
                    type="button"
                    onClick={vm.tentarNovamente}
                  >
                    Tentar novamente
                  </Button>
                </div>
              ) : (
                <>
                  {vm.semContas && (
                    <p role="alert" className="mb-4 text-sm text-destructive">
                      {vm.mensagemSemContas}
                    </p>
                  )}
                  <fieldset
                    disabled={vm.salvando || vm.semContas}
                    className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2"
                  >
                    <legend className="sr-only">Dados do lançamento</legend>
                    <div className="sm:col-span-2">
                      <Campo
                        label="Descrição *"
                        value={vm.valores.descricao}
                        maxLength={255}
                        onChange={(e) =>
                          vm.alterar("descricao", e.target.value)
                        }
                        erro={vm.erros.descricao}
                      />
                    </div>
                    {vm.exibirOrigem && (
                      <SeletorPesquisavel
                        label="Conta de origem *"
                        opcoes={vm.opcoes}
                        value={vm.valores.contaOrigemId}
                        onValueChange={(id) => vm.alterar("contaOrigemId", id)}
                        disabled={vm.salvando || vm.semContas}
                        erro={vm.erros.contaOrigemId}
                      />
                    )}
                    {vm.exibirDestino && (
                      <SeletorPesquisavel
                        label="Conta de destino *"
                        opcoes={vm.opcoes}
                        value={vm.valores.contaDestinoId}
                        onValueChange={(id) => vm.alterar("contaDestinoId", id)}
                        disabled={vm.salvando || vm.semContas}
                        erro={vm.erros.contaDestinoId}
                      />
                    )}
                    <Campo
                      label="Valor *"
                      value={vm.valores.valor}
                      inputMode="numeric"
                      placeholder="R$ 0,00"
                      onChange={(e) => vm.alterar("valor", e.target.value)}
                      erro={vm.erros.valor}
                    />
                    <CampoData
                      label="Data *"
                      value={vm.valores.data}
                      onValueChange={(v) => vm.alterar("data", v)}
                      max={vm.hoje}
                      disabled={vm.salvando || vm.semContas}
                      erro={vm.erros.data}
                    />
                  </fieldset>
                  {vm.erroSalvar && (
                    <p role="alert" className="mt-4 text-sm text-destructive">
                      {vm.erroSalvar}
                    </p>
                  )}
                </>
              )}
            </div>
            <footer className="flex justify-end gap-3 border-t p-5">
              <Button
                type="button"
                variant="outline"
                onClick={vm.fechar}
                disabled={vm.salvando}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={
                  vm.carregando || !!vm.erroCarga || vm.semContas || vm.salvando
                }
              >
                {vm.salvando && <Spinner />}
                {vm.salvando ? "Lançando…" : vm.titulo}
              </Button>
            </footer>
          </form>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
