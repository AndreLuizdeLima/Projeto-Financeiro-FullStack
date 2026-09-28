import { PencilLine, Plus } from 'lucide-react'
import { FormaRecebimentoFormModal } from '@/app/formas-recebimento/components/forma-recebimento-form-modal'
import { useFormasRecebimentoViewModel } from '@/app/formas-recebimento/view-model/use-formas-recebimento-view-model'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

function FormasRecebimentoPage() {
  const formasRecebimentoViewModel = useFormasRecebimentoViewModel()
  const {
    formasRecebimento,
    formasRecebimentoError,
    formasRecebimentoMetadata,
    formasRecebimentoQuery,
    modal,
    page,
  } = formasRecebimentoViewModel

  return (
    <section className="mx-auto w-full max-w-6xl">
      <header className="mb-8 flex flex-col gap-6 border-b border-border pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Cadastros
          </p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">
            Formas de recebimento
          </h1>
          <p className="mt-4 text-base font-medium text-muted-foreground sm:text-lg">
            Organize as formas disponíveis para registrar os recebimentos.
          </p>
        </div>
        <Button onClick={formasRecebimentoViewModel.openCreateModal} size="lg">
          <Plus aria-hidden="true" />
          Nova forma
        </Button>
      </header>

      <section aria-labelledby="formas-recebimento-table-title" className="overflow-hidden rounded-lg border border-border bg-card">
        <div className="border-b border-border p-5 sm:p-6">
          <h2 id="formas-recebimento-table-title" className="text-2xl font-semibold tracking-tight">
            Formas de recebimento cadastradas
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {formasRecebimentoMetadata
              ? `${formasRecebimentoMetadata.total} cadastro${formasRecebimentoMetadata.total === 1 ? '' : 's'} no histórico.`
              : 'Carregando histórico.'}
          </p>
        </div>

        {formasRecebimentoQuery.isLoading ? (
          <p className="p-6 font-medium text-muted-foreground" role="status">
            Carregando formas de recebimento...
          </p>
        ) : formasRecebimentoQuery.isError ? (
          <div className="space-y-4 p-6" role="alert">
            <p className="font-semibold text-destructive">{formasRecebimentoError}</p>
            <Button onClick={() => void formasRecebimentoQuery.refetch()} variant="outline">
              Tentar novamente
            </Button>
          </div>
        ) : formasRecebimento.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-lg font-semibold">Nenhuma forma de recebimento cadastrada.</p>
            <p className="mt-2 text-muted-foreground">Use “Nova forma” para criar o primeiro cadastro.</p>
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
                  {formasRecebimento.map((formaRecebimento) => (
                    <tr key={formaRecebimento.id} className="border-t border-border align-middle">
                      <td className="px-5 py-4">
                        <Button
                          aria-label={`Editar ${formaRecebimento.nome}`}
                          onClick={() => formasRecebimentoViewModel.openEditModal(formaRecebimento)}
                          size="sm"
                          variant="outline"
                        >
                          <PencilLine aria-hidden="true" />
                          Editar
                        </Button>
                      </td>
                      <td className="px-5 py-4 font-semibold">{formaRecebimento.nome}</td>
                      <td className="px-5 py-4">
                        <Badge variant={formaRecebimento.isActive ? 'positive' : 'secondary'}>
                          {formaRecebimento.isActive ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <footer className="flex flex-col gap-4 border-t border-border p-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                Página {formasRecebimentoMetadata?.page ?? page}
              </p>
              <div className="flex gap-3">
                <Button
                  disabled={page === 1 || formasRecebimentoQuery.isFetching}
                  onClick={() => formasRecebimentoViewModel.setPage((currentPage) => currentPage - 1)}
                  variant="outline"
                >
                  Anterior
                </Button>
                <Button
                  disabled={!formasRecebimentoMetadata?.hasNextPage || formasRecebimentoQuery.isFetching}
                  onClick={() => formasRecebimentoViewModel.setPage((currentPage) => currentPage + 1)}
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
        <FormaRecebimentoFormModal
          formaRecebimento={modal.type === 'edit' ? modal.formaRecebimento : undefined}
          isSaving={formasRecebimentoViewModel.isSaving}
          mode={modal.type}
          onClose={formasRecebimentoViewModel.closeModal}
          onSubmit={formasRecebimentoViewModel.saveFormaRecebimento}
          submissionError={formasRecebimentoViewModel.formSubmissionError}
        />
      ) : null}
    </section>
  )
}

export { FormasRecebimentoPage }
