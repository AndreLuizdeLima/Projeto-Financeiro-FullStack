import { PencilLine, Plus } from 'lucide-react'
import { ClienteFormModal } from '@/app/clientes/components/cliente-form-modal'
import { useClientesViewModel } from '@/app/clientes/view-model/use-clientes-view-model'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

function ClientesPage() {
  const clientesViewModel = useClientesViewModel()
  const { clientes, clientesError, clientesMetadata, clientesQuery, modal, page } =
    clientesViewModel

  return (
    <section className="mx-auto w-full max-w-6xl">
      <header className="mb-8 flex flex-col gap-6 border-b border-border pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Cadastros
          </p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">Clientes</h1>
          <p className="mt-4 text-base font-medium text-muted-foreground sm:text-lg">
            Mantenha as informações cadastrais e o status dos clientes da operação.
          </p>
        </div>
        <Button onClick={clientesViewModel.openCreateModal} size="lg">
          <Plus aria-hidden="true" />
          Novo cliente
        </Button>
      </header>

      <section aria-labelledby="clientes-table-title" className="overflow-hidden rounded-lg border border-border bg-card">
        <div className="flex flex-col gap-2 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <h2 id="clientes-table-title" className="text-2xl font-semibold tracking-tight">
              Clientes cadastrados
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {clientesMetadata
                ? `${clientesMetadata.total} cliente${clientesMetadata.total === 1 ? '' : 's'} no histórico.`
                : 'Carregando histórico.'}
            </p>
          </div>
        </div>

        {clientesQuery.isLoading ? (
          <p className="p-6 font-medium text-muted-foreground" role="status">
            Carregando clientes...
          </p>
        ) : clientesQuery.isError ? (
          <div className="space-y-4 p-6" role="alert">
            <p className="font-semibold text-destructive">{clientesError}</p>
            <Button onClick={() => void clientesQuery.refetch()} variant="outline">
              Tentar novamente
            </Button>
          </div>
        ) : clientes.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-lg font-semibold">Nenhum cliente cadastrado.</p>
            <p className="mt-2 text-muted-foreground">Use “Novo cliente” para criar o primeiro cadastro.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[52rem] text-left">
                <thead className="bg-secondary text-xs font-semibold uppercase tracking-[0.1em] text-secondary-foreground">
                  <tr>
                    <th className="px-5 py-4">Ações</th>
                    <th className="px-5 py-4">CNPJ</th>
                    <th className="px-5 py-4">Razão social</th>
                    <th className="px-5 py-4">Nome fantasia</th>
                    <th className="px-5 py-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {clientes.map((cliente) => (
                    <tr key={cliente.id} className="border-t border-border align-middle">
                      <td className="px-5 py-4">
                        <Button
                          aria-label={`Editar ${cliente.nomeFantasia}`}
                          onClick={() => clientesViewModel.openEditModal(cliente)}
                          size="sm"
                          variant="outline"
                        >
                          <PencilLine aria-hidden="true" />
                          Editar
                        </Button>
                      </td>
                      <td className="px-5 py-4 text-muted-foreground">{cliente.cnpj}</td>
                      <td className="px-5 py-4 font-semibold">{cliente.razaoSocial}</td>
                      <td className="px-5 py-4 text-muted-foreground">{cliente.nomeFantasia}</td>
                      <td className="px-5 py-4">
                        <Badge variant={cliente.isActive ? 'positive' : 'secondary'}>
                          {cliente.isActive ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <footer className="flex flex-col gap-4 border-t border-border p-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                Página {clientesMetadata?.page ?? page}
              </p>
              <div className="flex gap-3">
                <Button
                  disabled={page === 1 || clientesQuery.isFetching}
                  onClick={() => clientesViewModel.setPage((currentPage) => currentPage - 1)}
                  variant="outline"
                >
                  Anterior
                </Button>
                <Button
                  disabled={!clientesMetadata?.hasNextPage || clientesQuery.isFetching}
                  onClick={() => clientesViewModel.setPage((currentPage) => currentPage + 1)}
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
        <ClienteFormModal
          cliente={modal.type === 'edit' ? modal.cliente : undefined}
          isSaving={clientesViewModel.isSaving}
          mode={modal.type}
          onClose={clientesViewModel.closeModal}
          onSubmit={clientesViewModel.saveCliente}
          submissionError={clientesViewModel.formSubmissionError}
        />
      ) : null}
    </section>
  )
}

export { ClientesPage }
