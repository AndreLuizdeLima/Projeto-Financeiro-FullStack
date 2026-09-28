import { PencilLine, Plus } from 'lucide-react'
import { CentroDeCustoFormModal } from '@/app/centros-de-custo/components/centro-de-custo-form-modal'
import { useCentrosDeCustoViewModel } from '@/app/centros-de-custo/view-model/use-centros-de-custo-view-model'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

function CentrosDeCustoPage() {
  const centrosDeCustoViewModel = useCentrosDeCustoViewModel()
  const {
    centrosDeCusto,
    centrosDeCustoError,
    centrosDeCustoMetadata,
    centrosDeCustoQuery,
    modal,
    page,
  } = centrosDeCustoViewModel

  return (
    <section className="mx-auto w-full max-w-6xl">
      <header className="mb-8 flex flex-col gap-6 border-b border-border pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Cadastros
          </p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">
            Centros de custo
          </h1>
          <p className="mt-4 text-base font-medium text-muted-foreground sm:text-lg">
            Classifique os centros utilizados para acompanhar os custos da operação.
          </p>
        </div>
        <Button onClick={centrosDeCustoViewModel.openCreateModal} size="lg">
          <Plus aria-hidden="true" />
          Novo centro
        </Button>
      </header>

      <section aria-labelledby="centros-de-custo-table-title" className="overflow-hidden rounded-lg border border-border bg-card">
        <div className="border-b border-border p-5 sm:p-6">
          <h2 id="centros-de-custo-table-title" className="text-2xl font-semibold tracking-tight">
            Centros de custo cadastrados
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {centrosDeCustoMetadata
              ? `${centrosDeCustoMetadata.total} cadastro${centrosDeCustoMetadata.total === 1 ? '' : 's'} no histórico.`
              : 'Carregando histórico.'}
          </p>
        </div>

        {centrosDeCustoQuery.isLoading ? (
          <p className="p-6 font-medium text-muted-foreground" role="status">
            Carregando centros de custo...
          </p>
        ) : centrosDeCustoQuery.isError ? (
          <div className="space-y-4 p-6" role="alert">
            <p className="font-semibold text-destructive">{centrosDeCustoError}</p>
            <Button onClick={() => void centrosDeCustoQuery.refetch()} variant="outline">
              Tentar novamente
            </Button>
          </div>
        ) : centrosDeCusto.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-lg font-semibold">Nenhum centro de custo cadastrado.</p>
            <p className="mt-2 text-muted-foreground">Use “Novo centro” para criar o primeiro cadastro.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[34rem] text-left">
                <thead className="bg-secondary text-xs font-semibold uppercase tracking-[0.1em] text-secondary-foreground">
                  <tr>
                    <th className="px-5 py-4">Ações</th>
                    <th className="px-5 py-4">Nome</th>
                    <th className="px-5 py-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {centrosDeCusto.map((centroDeCusto) => (
                    <tr key={centroDeCusto.id} className="border-t border-border align-middle">
                      <td className="px-5 py-4">
                        <Button
                          aria-label={`Editar ${centroDeCusto.nome}`}
                          onClick={() => centrosDeCustoViewModel.openEditModal(centroDeCusto)}
                          size="sm"
                          variant="outline"
                        >
                          <PencilLine aria-hidden="true" />
                          Editar
                        </Button>
                      </td>
                      <td className="px-5 py-4 font-semibold">{centroDeCusto.nome}</td>
                      <td className="px-5 py-4">
                        <Badge variant={centroDeCusto.isActive ? 'positive' : 'secondary'}>
                          {centroDeCusto.isActive ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <footer className="flex flex-col gap-4 border-t border-border p-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                Página {centrosDeCustoMetadata?.page ?? page}
              </p>
              <div className="flex gap-3">
                <Button
                  disabled={page === 1 || centrosDeCustoQuery.isFetching}
                  onClick={() => centrosDeCustoViewModel.setPage((currentPage) => currentPage - 1)}
                  variant="outline"
                >
                  Anterior
                </Button>
                <Button
                  disabled={!centrosDeCustoMetadata?.hasNextPage || centrosDeCustoQuery.isFetching}
                  onClick={() => centrosDeCustoViewModel.setPage((currentPage) => currentPage + 1)}
                  variant="outline"
                >
                  Próxima
                </Button>
              </div>
            </footer>
          </>
        )}
      </section>

      {modal ? (
        <CentroDeCustoFormModal
          centroDeCusto={modal.type === 'edit' ? modal.centroDeCusto : undefined}
          isSaving={centrosDeCustoViewModel.isSaving}
          mode={modal.type}
          onClose={centrosDeCustoViewModel.closeModal}
          onSubmit={centrosDeCustoViewModel.saveCentroDeCusto}
          submissionError={centrosDeCustoViewModel.formSubmissionError}
        />
      ) : null}
    </section>
  )
}

export { CentrosDeCustoPage }
