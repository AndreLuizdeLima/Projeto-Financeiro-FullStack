import { PencilLine, Plus } from 'lucide-react'
import { ContaBancariaFormModal } from '@/app/contas-bancarias/components/conta-bancaria-form-modal'
import { tipoDeContaBancariaLabels } from '@/app/contas-bancarias/api/contas-bancarias-api'
import { useContasBancariasViewModel } from '@/app/contas-bancarias/view-model/use-contas-bancarias-view-model'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

function ContasBancariasPage() {
  const contasBancariasViewModel = useContasBancariasViewModel()
  const {
    contasBancarias,
    contasBancariasError,
    contasBancariasMetadata,
    contasBancariasQuery,
    modal,
    page,
  } = contasBancariasViewModel

  return (
    <section className="mx-auto w-full max-w-6xl">
      <header className="mb-8 flex flex-col gap-6 border-b border-border pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Cadastros
          </p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">
            Contas bancárias
          </h1>
          <p className="mt-4 text-base font-medium text-muted-foreground sm:text-lg">
            Centralize as contas bancárias disponíveis na operação financeira.
          </p>
        </div>
        <Button onClick={contasBancariasViewModel.openCreateModal} size="lg">
          <Plus aria-hidden="true" />
          Nova conta
        </Button>
      </header>

      <section aria-labelledby="contas-bancarias-table-title" className="overflow-hidden rounded-lg border border-border bg-card">
        <div className="border-b border-border p-5 sm:p-6">
          <h2 id="contas-bancarias-table-title" className="text-2xl font-semibold tracking-tight">
            Contas bancárias cadastradas
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {contasBancariasMetadata
              ? `${contasBancariasMetadata.total} conta${contasBancariasMetadata.total === 1 ? '' : 's'} no histórico.`
              : 'Carregando histórico.'}
          </p>
        </div>

        {contasBancariasQuery.isLoading ? (
          <p className="p-6 font-medium text-muted-foreground" role="status">
            Carregando contas bancárias...
          </p>
        ) : contasBancariasQuery.isError ? (
          <div className="space-y-4 p-6" role="alert">
            <p className="font-semibold text-destructive">{contasBancariasError}</p>
            <Button onClick={() => void contasBancariasQuery.refetch()} variant="outline">
              Tentar novamente
            </Button>
          </div>
        ) : contasBancarias.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-lg font-semibold">Nenhuma conta bancária cadastrada.</p>
            <p className="mt-2 text-muted-foreground">Use “Nova conta” para criar o primeiro cadastro.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[48rem] text-left">
                <thead className="bg-secondary text-xs font-semibold uppercase tracking-[0.1em] text-secondary-foreground">
                  <tr>
                    <th className="px-5 py-4">Ações</th>
                    <th className="px-5 py-4">Nome</th>
                    <th className="px-5 py-4">Conta</th>
                    <th className="px-5 py-4">Tipo</th>
                    <th className="px-5 py-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {contasBancarias.map((contaBancaria) => (
                    <tr key={contaBancaria.id} className="border-t border-border align-middle">
                      <td className="px-5 py-4">
                        <Button
                          aria-label={`Editar ${contaBancaria.nome}`}
                          onClick={() => contasBancariasViewModel.openEditModal(contaBancaria)}
                          size="sm"
                          variant="outline"
                        >
                          <PencilLine aria-hidden="true" />
                          Editar
                        </Button>
                      </td>
                      <td className="px-5 py-4 font-semibold">{contaBancaria.nome}</td>
                      <td className="px-5 py-4 text-muted-foreground">{contaBancaria.conta}</td>
                      <td className="px-5 py-4 text-muted-foreground">
                        {tipoDeContaBancariaLabels[contaBancaria.tipo]}
                      </td>
                      <td className="px-5 py-4">
                        <Badge variant={contaBancaria.isActive ? 'positive' : 'secondary'}>
                          {contaBancaria.isActive ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <footer className="flex flex-col gap-4 border-t border-border p-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                Página {contasBancariasMetadata?.page ?? page}
              </p>
              <div className="flex gap-3">
                <Button
                  disabled={page === 1 || contasBancariasQuery.isFetching}
                  onClick={() => contasBancariasViewModel.setPage((currentPage) => currentPage - 1)}
                  variant="outline"
                >
                  Anterior
                </Button>
                <Button
                  disabled={!contasBancariasMetadata?.hasNextPage || contasBancariasQuery.isFetching}
                  onClick={() => contasBancariasViewModel.setPage((currentPage) => currentPage + 1)}
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
        <ContaBancariaFormModal
          contaBancaria={modal.type === 'edit' ? modal.contaBancaria : undefined}
          isSaving={contasBancariasViewModel.isSaving}
          mode={modal.type}
          onClose={contasBancariasViewModel.closeModal}
          onSubmit={contasBancariasViewModel.saveContaBancaria}
          submissionError={contasBancariasViewModel.formSubmissionError}
        />
      ) : null}
    </section>
  )
}

export { ContasBancariasPage }
