import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Dialog } from "@base-ui/react/dialog";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { SeletorPesquisavel } from "@/components/ui/seletor-pesquisavel";
import { CampoData } from "@/components/ui/campo-data";
import { Campo } from "@/app/cadastros/view/Campo";
import {
  useContaFormularioViewModel,
  type ContaFormularioProps,
} from "../view-model/useContaFormularioViewModel";

export const ContaFormularioModal = (props: ContaFormularioProps) => {
  const vm = useContaFormularioViewModel(props);
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
            props.focoRetorno?.isConnected
              ? props.focoRetorno
              : document.getElementById("adicionar-conta")
          }
          className="fixed top-1/2 left-1/2 z-50 flex max-h-[90svh] w-[calc(100%-2rem)] max-w-5xl -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-xl border bg-popover text-popover-foreground shadow-lg"
        >
          <header className="flex shrink-0 items-start justify-between gap-4 border-b p-5 sm:px-6">
            <div>
              <Dialog.Title className="text-xl font-semibold">
                {vm.titulo}
              </Dialog.Title>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Fechar formulário"
              disabled={vm.salvando}
              onClick={vm.fechar}
            >
              <X />
            </Button>
          </header>
          <form
            className="flex min-h-0 flex-1 flex-col"
            onSubmit={(event) => {
              event.preventDefault();
              void vm.enviar();
            }}
            noValidate
            aria-busy={vm.carregando || vm.salvando}
          >
            <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-6">
              {vm.carregando ? (
                <div
                  role="status"
                  className="flex items-center justify-center gap-2 py-12"
                >
                  <Spinner />
                  Carregando dados do lançamento…
                </div>
              ) : vm.erroCarga ? (
                <div role="alert" className="flex flex-col items-start gap-3">
                  <span>{vm.erroCarga}</span>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={vm.tentarNovamente}
                  >
                    Tentar novamente
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  {vm.bloqueada && (
                    <p role="alert" className="text-sm text-destructive">
                      Esta conta não pode ser editada nesta tela. Somente contas
                      abertas do tipo atual podem ser alteradas.
                    </p>
                  )}
                  {vm.semCliente && (
                    <p role="alert" className="text-sm text-destructive">
                      Cadastre um cliente ativo na tela de Clientes antes de
                      salvar.
                    </p>
                  )}
                  {vm.semPlano && (
                    <p role="alert" className="text-sm text-destructive">
                      Cadastre um plano de contas analítico ativo antes de
                      salvar.
                    </p>
                  )}
                  <fieldset
                    disabled={vm.salvando || vm.bloqueada}
                    className="min-w-0"
                  >
                    <legend className="mb-4 font-semibold">Lançamento</legend>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="sm:col-span-1">
                        <Campo
                          label="Descrição *"
                          value={vm.valores.descricao}
                          maxLength={255}
                          erro={vm.erros.descricao}
                          onChange={(e) =>
                            vm.alterar("descricao", e.target.value)
                          }
                        />
                      </div>
                      <Campo
                        label="Valor original (R$) *"
                        value={vm.valorTexto}
                        inputMode="decimal"
                        placeholder="R$ 0,00"
                        erro={vm.erros.valorOriginal}
                        onChange={(e) => vm.alterarValor(e.target.value)}
                      />

                      <CampoData
                        label="Emissão *"
                        disabled={vm.salvando || vm.bloqueada}
                        value={vm.valores.dataEmissao}
                        erro={vm.erros.dataEmissao}
                        onValueChange={(data) =>
                          vm.alterar("dataEmissao", data)
                        }
                      />
                      <CampoData
                        label="Vencimento *"
                        disabled={vm.salvando || vm.bloqueada}
                        value={vm.valores.dataVencimento}
                        erro={vm.erros.dataVencimento}
                        onValueChange={(data) =>
                          vm.alterar("dataVencimento", data)
                        }
                      />
                    </div>
                  </fieldset>
                  <fieldset
                    disabled={vm.salvando || vm.bloqueada}
                    className="min-w-0 border-t pt-5"
                  >
                    <legend className="pr-3 font-semibold">
                      Classificação
                    </legend>
                    <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <SeletorPesquisavel
                          label="Cliente *"
                          value={vm.valores.clienteId}
                          opcoes={vm.referencias?.clientes ?? []}
                          erro={vm.erros.clienteId}
                          disabled={vm.salvando || vm.bloqueada}
                          onValueChange={(id) => vm.alterar("clienteId", id)}
                        />
                      </div>
                      <SeletorPesquisavel
                        label="Plano de contas *"
                        value={vm.valores.planoDeContaId}
                        opcoes={vm.referencias?.planos ?? []}
                        erro={vm.erros.planoDeContaId}
                        disabled={vm.salvando || vm.bloqueada}
                        onValueChange={(id) => vm.alterar("planoDeContaId", id)}
                      />
                      <SeletorPesquisavel
                        label="Centro de custo"
                        value={vm.valores.centroDeCustoId}
                        opcoes={vm.referencias?.centros ?? []}
                        erro={vm.erros.centroDeCustoId}
                        opcional
                        disabled={vm.salvando || vm.bloqueada}
                        onValueChange={(id) =>
                          vm.alterar("centroDeCustoId", id)
                        }
                      />
                    </div>
                  </fieldset>
                  <fieldset
                    disabled={vm.salvando || vm.bloqueada}
                    className="min-w-0 border-t pt-5"
                  >
                    <legend className="pr-3 font-semibold">Encargos</legend>
                    <Label className="mt-2 mb-4 flex items-center gap-2">
                      <Checkbox
                        checked={vm.encargosAtivos}
                        onCheckedChange={vm.alterarEncargos}
                        disabled={vm.salvando || vm.bloqueada}
                      />
                      Aplicar juros e multa
                    </Label>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <Campo
                        label="Juros diários (%)"
                        disabled={
                          !vm.encargosAtivos || vm.salvando || vm.bloqueada
                        }
                        inputMode="decimal"
                        value={vm.valores.taxaJurosDiaria}
                        erro={vm.erros.taxaJurosDiaria}
                        onChange={(e) =>
                          vm.alterar("taxaJurosDiaria", e.target.value)
                        }
                      />
                      <Campo
                        label="Multa (%)"
                        disabled={
                          !vm.encargosAtivos || vm.salvando || vm.bloqueada
                        }
                        inputMode="decimal"
                        value={vm.valores.taxaMulta}
                        erro={vm.erros.taxaMulta}
                        onChange={(e) =>
                          vm.alterar("taxaMulta", e.target.value)
                        }
                      />
                    </div>
                  </fieldset>
                  {vm.erroSalvar && (
                    <p role="alert" className="text-sm text-destructive">
                      {vm.erroSalvar}
                    </p>
                  )}
                </div>
              )}
            </div>
            <footer className="flex shrink-0 justify-end gap-2 border-t bg-popover p-4 sm:px-6">
              <Button
                type="button"
                variant="outline"
                disabled={vm.salvando}
                onClick={vm.fechar}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={!vm.podeSalvar}>
                {vm.salvando && <Spinner />}
                {vm.salvando ? "Salvando…" : "Salvar conta"}
              </Button>
            </footer>
          </form>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
