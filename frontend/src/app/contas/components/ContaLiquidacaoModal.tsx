import { Dialog } from "@base-ui/react/dialog";
import { CircleDollarSign, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CampoData } from "@/components/ui/campo-data";
import { SeletorPesquisavel } from "@/components/ui/seletor-pesquisavel";
import { Spinner } from "@/components/ui/spinner";
import {
  useContaLiquidacaoViewModel,
  type ContaLiquidacaoProps,
} from "../view-model/useContaLiquidacaoViewModel";

export const ContaLiquidacaoModal = (props: ContaLiquidacaoProps) => {
  const vm = useContaLiquidacaoViewModel(props);
  return (
    <Dialog.Root
      open
      onOpenChange={(open) => {
        if (!open) vm.voltar();
      }}
    >
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/40" />
        <Dialog.Popup
          finalFocus={() =>
            props.focoRetorno.isConnected
              ? props.focoRetorno
              : document.getElementById("adicionar-conta")
          }
          className="fixed top-1/2 left-1/2 z-50 flex max-h-[90svh] w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-xl border bg-popover text-popover-foreground shadow-lg"
        >
          <header className="flex shrink-0 items-start justify-between gap-4 border-b p-5 sm:px-6">
            <div>
              <Dialog.Title className="text-xl font-semibold">
                {vm.titulo}
              </Dialog.Title>
              <Dialog.Description className="mt-1 text-sm text-muted-foreground">
                Liquidação integral da conta. Confira os dados e o total antes
                de confirmar.
              </Dialog.Description>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Fechar liquidação"
              disabled={vm.salvando}
              onClick={vm.voltar}
            >
              <X />
            </Button>
          </header>
          <form
            className="flex min-h-0 flex-1 flex-col"
            noValidate
            onSubmit={(event) => {
              event.preventDefault();
              void vm.confirmar();
            }}
            aria-busy={vm.salvando}
          >
            <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-5 sm:p-6">
              {vm.identificacao && (
                <div className="space-y-1 rounded-lg border bg-muted/30 p-4">
                  <p className="font-medium wrap-break-word">
                    {vm.identificacao.conta.descricao}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Cliente: {vm.identificacao.conta.clienteNome}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Vencimento: {vm.vencimento}
                  </p>
                </div>
              )}
              <CampoData
                label={vm.labelData}
                value={vm.dataPagamento}
                min={vm.dataMinima}
                max={vm.dataMaxima}
                onValueChange={vm.alterarData}
                disabled={vm.salvando || vm.bloqueada}
              />
              {vm.carregandoOpcoes ? (
                <div role="status" className="flex items-center gap-2 text-sm">
                  <Spinner />
                  Carregando contas bancárias e formas…
                </div>
              ) : vm.erroOpcoes ? (
                <div role="alert" className="space-y-2">
                  <p className="text-sm text-destructive">{vm.erroOpcoes}</p>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={vm.salvando}
                    onClick={vm.tentarOpcoes}
                  >
                    Tentar carregar cadastros novamente
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="min-w-0 space-y-2">
                    <SeletorPesquisavel
                      label={vm.labelBanco}
                      opcoes={vm.opcoes?.bancos ?? []}
                      value={vm.bancoId}
                      onValueChange={vm.alterarBanco}
                      erro={vm.erros.banco}
                      disabled={vm.salvando || vm.bloqueada || vm.semBancos}
                    />
                    {vm.semBancos && (
                      <p role="alert" className="text-sm text-destructive">
                        Cadastre uma conta bancária ativa para continuar.
                      </p>
                    )}
                  </div>
                  <div className="min-w-0 space-y-2">
                    <SeletorPesquisavel
                      label={vm.labelForma}
                      opcoes={vm.opcoes?.formas ?? []}
                      value={vm.formaId}
                      onValueChange={vm.alterarForma}
                      erro={vm.erros.forma}
                      disabled={vm.salvando || vm.bloqueada || vm.semFormas}
                    />
                    {vm.semFormas && (
                      <p role="alert" className="text-sm text-destructive">
                        Cadastre uma forma de recebimento ativa para continuar.
                      </p>
                    )}
                  </div>
                </div>
              )}
              <section
                className="rounded-lg border p-4"
                aria-label="Resumo da liquidação"
                aria-live="polite"
                aria-busy={vm.carregandoPrevia}
              >
                {vm.carregandoPrevia ? (
                  <div
                    role="status"
                    className="flex items-center gap-2 text-sm"
                  >
                    <Spinner />
                    Calculando valores…
                  </div>
                ) : vm.erroPrevia ? (
                  <div className="space-y-2">
                    <p role="alert" className="text-sm text-destructive">
                      {vm.erroPrevia}
                    </p>
                    {!vm.bloqueada && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={vm.tentarPrevia}
                        disabled={vm.salvando}
                      >
                        Recalcular valores
                      </Button>
                    )}
                  </div>
                ) : (
                  <dl className="space-y-2 text-sm">
                    {vm.resumo.map((item) => (
                      <div
                        key={item.label}
                        className="flex justify-between gap-4"
                      >
                        <dt className="text-muted-foreground">{item.label}</dt>
                        <dd className="tabular-nums">{item.valor}</dd>
                      </div>
                    ))}
                    <div className="flex justify-between gap-4 border-t pt-3 text-base font-semibold">
                      <dt>{vm.labelTotal}</dt>
                      <dd className="tabular-nums">{vm.valorTotal}</dd>
                    </div>
                  </dl>
                )}
              </section>
              {vm.erroSalvar && (
                <p role="alert" className="text-sm text-destructive">
                  {vm.erroSalvar}
                </p>
              )}
            </div>
            <footer className="flex shrink-0 flex-wrap justify-end gap-2 border-t bg-popover p-4 sm:px-6">
              <Button
                type="button"
                variant="outline"
                disabled={vm.salvando}
                onClick={vm.voltar}
              >
                Voltar
              </Button>
              <Button type="submit" disabled={!vm.podeConfirmar}>
                {vm.salvando ? <Spinner /> : <CircleDollarSign />}
                {vm.salvando ? "Liquidando…" : vm.labelConfirmar}
              </Button>
            </footer>
          </form>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
