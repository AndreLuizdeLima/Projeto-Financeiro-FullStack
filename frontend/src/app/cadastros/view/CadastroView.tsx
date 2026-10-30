import type { ReactNode } from "react";
import { Dialog } from "@base-ui/react/dialog";
import { Eye, Pencil, Plus, RotateCcw, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import type { Registro, FormularioProps } from "../model/cadastro";
import type { useCadastro } from "../view-model/useCadastro";

export type Coluna<T> = { titulo: string; valor: (item: T) => ReactNode };
const Modal = ({
  titulo,
  descricao,
  fechar,
  ocupado,
  children,
}: {
  titulo: string;
  descricao: string;
  fechar: () => void;
  ocupado: boolean;
  children: ReactNode;
}) => (
  <Dialog.Root
    open
    onOpenChange={(open) => {
      if (!open && !ocupado) fechar();
    }}
  >
    <Dialog.Portal>
      <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/40" />
      <Dialog.Popup className="fixed top-1/2 left-1/2 z-50 max-h-[90svh] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl border bg-popover p-6 shadow-lg">
        <Dialog.Title className="text-lg font-semibold">{titulo}</Dialog.Title>
        <Dialog.Description className="mt-1 text-sm text-muted-foreground">
          {descricao}
        </Dialog.Description>
        <div className="mt-5">{children}</div>
        <div className="mt-4 flex justify-end">
          <Button variant="outline" disabled={ocupado} onClick={fechar}>
            Fechar
          </Button>
        </div>
      </Dialog.Popup>
    </Dialog.Portal>
  </Dialog.Root>
);

export const CadastroView = <T extends Registro, C, U>({
  titulo,
  singular,
  colunas,
  vm,
  formulario,
}: {
  titulo: string;
  singular: string;
  colunas: Coluna<T>[];
  vm: ReturnType<typeof useCadastro<T, C, U>>;
  formulario: (props: FormularioProps<T, C, U>) => ReactNode;
}) => (
  <section className="flex min-w-0 flex-col gap-5 p-4">
    <header className="flex flex-wrap items-center justify-between gap-3">
      <h1 className="text-2xl font-semibold">{titulo}</h1>
      <Button onClick={() => void vm.abrir("criar")}>
        <Plus />
        Novo cadastro
      </Button>
    </header>
    <div className="min-w-0 rounded-xl border bg-card">
      {vm.carregando ? (
        <div
          role="status"
          className="flex items-center justify-center gap-2 p-10"
        >
          <Spinner />
          Carregando cadastros…
        </div>
      ) : vm.erro ? (
        <div role="alert" className="flex flex-col items-center gap-3 p-8">
          <span>{vm.erro}</span>
          <Button variant="outline" onClick={() => vm.recarregar()}>
            Tentar novamente
          </Button>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-muted">
                <tr>
                  {colunas.map((coluna) => (
                    <th
                      key={coluna.titulo}
                      scope="col"
                      className="px-4 py-3 font-medium"
                    >
                      {coluna.titulo}
                    </th>
                  ))}
                  <th scope="col" className="px-4 py-3">
                    Status
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {vm.dados?.data.length ? (
                  vm.dados.data.map((item) => (
                    <tr key={item.id} className="border-b last:border-0">
                      {colunas.map((coluna) => (
                        <td key={coluna.titulo} className="px-4 py-3">
                          {coluna.valor(item)}
                        </td>
                      ))}
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-md px-2 py-1 text-xs font-medium ${item.isActive ? "bg-emerald-50 text-emerald-800" : "bg-muted text-muted-foreground"}`}
                        >
                          {item.isActive ? "Ativo" : "Inativo"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div
                          className="flex gap-1"
                          role="group"
                          aria-label={`Ações de ${vm.politica.nome(item)}`}
                        >
                          <Button
                            size="icon-sm"
                            variant="outline"
                            aria-label="Visualizar"
                            title="Visualizar"
                            disabled={vm.ocupado}
                            onClick={() => void vm.abrir("consultar", item)}
                          >
                            <Eye aria-hidden="true" />
                          </Button>
                          {vm.politica.podeEditar(item) && (
                            <Button
                              size="icon-sm"
                              variant="default"
                              aria-label="Editar"
                              title="Editar"
                              disabled={vm.ocupado}
                              onClick={() => void vm.abrir("editar", item)}
                            >
                              <Pencil aria-hidden="true" />
                            </Button>
                          )}
                          {item.isActive ? (
                            <Button
                              size="icon-sm"
                              variant="destructive"
                              aria-label="Inativar"
                              title="Inativar"
                              disabled={vm.ocupado}
                              onClick={() => vm.confirmarInativacao(item)}
                            >
                              <Trash aria-hidden="true" />
                            </Button>
                          ) : (
                            vm.politica.reativacao && (
                              <Button
                                size="icon-sm"
                                variant="ghost"
                                aria-label="Reativar"
                                title="Reativar"
                                disabled={vm.ocupado}
                                onClick={() => vm.reativar(item)}
                              >
                                <RotateCcw aria-hidden="true" />
                              </Button>
                            )
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={colunas.length + 2}
                      className="p-8 text-center text-muted-foreground"
                    >
                      Nenhum cadastro nesta página.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <footer className="flex flex-wrap items-center justify-between gap-3 border-t p-4">
            <span className="text-sm text-muted-foreground">
              Página {vm.page} · {vm.dados?.meta.total ?? 0} registros
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                disabled={vm.page === 1 || vm.ocupado}
                onClick={() => vm.mudarPagina(vm.page - 1)}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                disabled={!vm.dados?.meta.hasNextPage || vm.ocupado}
                onClick={() => vm.mudarPagina(vm.page + 1)}
              >
                Próxima
              </Button>
            </div>
          </footer>
        </>
      )}
    </div>
    {vm.erroAcao && !vm.modal && !vm.confirmacao && (
      <span role="alert" className="text-sm text-destructive">
        {vm.erroAcao}
      </span>
    )}
    {vm.modal && (
      <Modal
        titulo={`${vm.modal.modo === "criar" ? "Novo cadastro" : vm.modal.modo === "consultar" ? "Visualizar" : "Editar"} · ${singular}`}
        descricao="Dados do cadastro."
        fechar={vm.fechar}
        ocupado={vm.ocupado}
      >
        {vm.modal.carregando ? (
          <div role="status" className="flex items-center gap-2">
            <Spinner />
            Carregando dados…
          </div>
        ) : vm.modal.erro ? (
          <div role="alert" className="flex flex-col gap-3">
            <span>{vm.modal.erro}</span>
            <Button
              onClick={() => void vm.abrir(vm.modal!.modo, vm.modal!.registro)}
            >
              Tentar novamente
            </Button>
          </div>
        ) : (
          formulario({
            registro: vm.modal.registro,
            modo: vm.modal.modo,
            ocupado: vm.ocupado,
            salvar: vm.salvar,
          })
        )}
        {vm.erroAcao && (
          <span role="alert" className="mt-3 block text-sm text-destructive">
            {vm.erroAcao}
          </span>
        )}
      </Modal>
    )}
    {vm.confirmacao && (
      <Modal
        titulo={`Inativar ${singular}`}
        descricao={`Deseja inativar “${vm.politica.nome(vm.confirmacao)}”? O registro será preservado no histórico.`}
        fechar={vm.fechar}
        ocupado={vm.ocupado}
      >
        <Button disabled={vm.ocupado} onClick={() => void vm.inativar()}>
          {vm.ocupado ? "Inativando…" : "Confirmar inativação"}
        </Button>
        {vm.erroAcao && (
          <span role="alert" className="mt-3 block text-sm text-destructive">
            {vm.erroAcao}
          </span>
        )}
      </Modal>
    )}
  </section>
);
