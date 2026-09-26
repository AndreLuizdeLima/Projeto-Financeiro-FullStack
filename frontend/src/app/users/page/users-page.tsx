import { PencilLine, Plus, Power, UsersRound } from 'lucide-react'
import { DeactivateUserDialog } from '@/app/users/components/deactivate-user-dialog'
import { UserFormModal } from '@/app/users/components/user-form-modal'
import { useUsersViewModel } from '@/app/users/view-model/use-users-view-model'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

function formatCreationDate(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return 'Data indisponível'
  }

  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium' }).format(date)
}

function UsersPage() {
  const usersViewModel = useUsersViewModel()
  const {
    modal,
    page,
    userToDeactivate,
    users,
    usersError,
    usersMetadata,
    usersQuery,
  } = usersViewModel

  return (
    <section className="mx-auto w-full max-w-6xl">
      <header className="mb-8 flex flex-col gap-6 border-b-2 border-border pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <p className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
            Administração
          </p>
          <h1 className="mt-2 text-4xl font-black tracking-[-0.06em] sm:text-6xl">
            Cadastro de usuários.
          </h1>
          <p className="mt-4 text-base font-medium text-muted-foreground sm:text-lg">
            Gerencie os acessos ativos e mantenha o histórico de usuários inativados.
          </p>
        </div>
        <Button onClick={usersViewModel.openCreateModal} size="lg">
          <Plus aria-hidden="true" />
          Novo usuário
        </Button>
      </header>

      <section
        aria-labelledby="users-table-title"
        className="border-2 border-border bg-card shadow-[4px_4px_0_var(--shadow-color)]"
      >
        <div className="flex flex-col gap-2 border-b-2 border-border p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <h2 id="users-table-title" className="text-2xl font-black tracking-tight">
              Usuários cadastrados
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {usersMetadata
                ? `${usersMetadata.total} usuário${usersMetadata.total === 1 ? '' : 's'} no histórico.`
                : 'Carregando histórico.'}
            </p>
          </div>
          <UsersRound aria-hidden="true" className="size-7 text-muted-foreground" />
        </div>

        {usersQuery.isLoading ? (
          <p className="p-6 font-medium text-muted-foreground" role="status">
            Carregando usuários...
          </p>
        ) : usersQuery.isError ? (
          <div className="space-y-4 p-6" role="alert">
            <p className="font-bold text-destructive">{usersError}</p>
            <Button onClick={() => void usersQuery.refetch()} variant="outline">
              Tentar novamente
            </Button>
          </div>
        ) : users.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-lg font-black">Nenhum usuário cadastrado.</p>
            <p className="mt-2 text-muted-foreground">
              Use “Novo usuário” para criar o primeiro acesso.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[47.5rem] text-left">
                <thead className="bg-secondary text-xs font-black uppercase tracking-[0.12em] text-secondary-foreground">
                  <tr>
                    <th className="px-5 py-4">Ações</th>
                    <th className="px-5 py-4">Nome</th>
                    <th className="px-5 py-4">E-mail</th>
                    <th className="px-5 py-4">Criado em</th>
                    <th className="px-5 py-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-t-2 border-border align-middle">
                        <td className="px-5 py-4">
                          <div className="flex flex-wrap gap-2">
                            {usersViewModel.canEditUser(user) ? (
                              <Button
                                aria-label={`Editar ${user.nome}`}
                                onClick={() => usersViewModel.openEditModal(user)}
                                size="sm"
                                variant="outline"
                              >
                                <PencilLine aria-hidden="true" />
                                Editar
                              </Button>
                            ) : null}
                            {user.isActive ? (
                              <Button
                                aria-label={`Inativar ${user.nome}`}
                                disabled={
                                  !usersViewModel.canDeactivateUser(user) ||
                                  usersViewModel.isDeactivating
                                }
                                onClick={() => usersViewModel.requestDeactivation(user)}
                                size="sm"
                                variant="destructive"
                              >
                                <Power aria-hidden="true" />
                                Inativar
                              </Button>
                            ) : null}
                          </div>
                        </td>
                        <td className="px-5 py-4 font-bold">{user.nome}</td>
                        <td className="px-5 py-4 text-muted-foreground">{user.email}</td>
                        <td className="px-5 py-4 text-muted-foreground">
                          {formatCreationDate(user.createDate)}
                        </td>
                        <td className="px-5 py-4">
                          <Badge variant={user.isActive ? 'positive' : 'secondary'}>
                            {user.isActive ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <footer className="flex flex-col gap-4 border-t-2 border-border p-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="font-mono text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
                Página {usersMetadata?.page ?? page}
              </p>
              <div className="flex gap-3">
                <Button
                  disabled={page === 1 || usersQuery.isFetching}
                  onClick={() => usersViewModel.setPage((currentPage) => currentPage - 1)}
                  variant="outline"
                >
                  Anterior
                </Button>
                <Button
                  disabled={!usersMetadata?.hasNextPage || usersQuery.isFetching}
                  onClick={() => usersViewModel.setPage((currentPage) => currentPage + 1)}
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
        <UserFormModal
          isSaving={usersViewModel.isSaving}
          mode={modal.type}
          onClose={usersViewModel.closeModal}
          onSubmit={usersViewModel.saveUser}
          submissionError={usersViewModel.formSubmissionError}
          user={modal.type === 'edit' ? modal.user : undefined}
        />
      ) : null}

      {userToDeactivate ? (
        <DeactivateUserDialog
          isSaving={usersViewModel.isDeactivating}
          onClose={usersViewModel.closeDeactivationDialog}
          onConfirm={usersViewModel.deactivateSelectedUser}
          user={userToDeactivate}
        />
      ) : null}
    </section>
  )
}

export { UsersPage }
