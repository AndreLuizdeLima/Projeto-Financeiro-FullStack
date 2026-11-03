import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination";
import { ContasTabelaDados } from "../components/ContasTabelaDados";
import type { ContasViewModel } from "../view-model/useContasViewModel";

export const ContasTabela = ({ vm }: { vm: ContasViewModel }) => (
  <div
    className="min-w-0 overflow-hidden rounded-xl border bg-card"
    aria-busy={vm.carregando}
  >
    {vm.carregando ? (
      <div
        role="status"
        className="flex items-center justify-center gap-2 p-10"
      >
        <Spinner />
        Carregando contas…
      </div>
    ) : vm.erro ? (
      <div role="alert" className="flex flex-col items-center gap-3 p-8">
        <span>{vm.erro}</span>
        <Button variant="outline" onClick={vm.recarregar}>
          Tentar novamente
        </Button>
      </div>
    ) : (
      <>
        <ContasTabelaDados
          titulo={vm.titulo}
          linhas={vm.linhas}
          onEditar={vm.editarConta}
          onCancelar={vm.solicitarCancelamento}
          ocupado={vm.cancelando}
        />
        <footer className="flex flex-wrap items-center justify-between gap-3 border-t p-4">
          <span className="text-sm text-muted-foreground" aria-live="polite">
            Página {vm.page} · {vm.total} registros
          </span>
          <Pagination className="mx-0 w-auto" aria-label="Paginação das contas">
            <PaginationContent>
              <PaginationItem>
                <Button
                  variant="outline"
                  disabled={vm.page === 1}
                  onClick={() => vm.mudarPagina(vm.page - 1)}
                >
                  Anterior
                </Button>
              </PaginationItem>
              <PaginationItem>
                <Button
                  variant="outline"
                  disabled={!vm.hasNextPage}
                  onClick={() => vm.mudarPagina(vm.page + 1)}
                >
                  Próxima
                </Button>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </footer>
      </>
    )}
  </div>
);
