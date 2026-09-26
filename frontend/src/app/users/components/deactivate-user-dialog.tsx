import { AlertTriangle, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { UserListItem } from '@/app/users/api/users-api'

type DeactivateUserDialogProps = {
  user: UserListItem
  isSaving: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
}

function DeactivateUserDialog({
  user,
  isSaving,
  onClose,
  onConfirm,
}: DeactivateUserDialogProps) {
  async function handleConfirm() {
    try {
      await onConfirm()
    } catch {
      // The page shows a toast when the request fails.
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/35 p-4">
      <section
        aria-describedby="deactivate-user-description"
        aria-labelledby="deactivate-user-title"
        aria-modal="true"
        className="w-full max-w-md border-2 border-border bg-card shadow-[6px_6px_0_var(--shadow-color)]"
        role="alertdialog"
      >
        <header className="flex items-start justify-between gap-5 border-b-2 border-border p-5 sm:p-6">
          <div>
            <div className="flex items-center gap-2 text-warning">
              <AlertTriangle aria-hidden="true" className="size-5" />
              <span className="font-mono text-xs font-bold uppercase tracking-[0.18em]">
                Confirmação
              </span>
            </div>
            <h2 id="deactivate-user-title" className="mt-3 text-2xl font-black tracking-tight">
              Inativar usuário?
            </h2>
          </div>
          <Button
            aria-label="Fechar confirmação"
            disabled={isSaving}
            onClick={onClose}
            size="icon"
            type="button"
            variant="ghost"
          >
            <X aria-hidden="true" />
          </Button>
        </header>

        <div className="space-y-6 p-5 sm:p-6">
          <p id="deactivate-user-description" className="leading-6 text-muted-foreground">
            Tem certeza que deseja inativar{' '}
            <strong className="text-foreground">{user.nome}</strong>?
          </p>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button disabled={isSaving} onClick={onClose} type="button" variant="outline">
              Cancelar
            </Button>
            <Button disabled={isSaving} onClick={() => void handleConfirm()} type="button" variant="destructive">
              {isSaving ? 'Inativando...' : 'Inativar usuário'}
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}

export { DeactivateUserDialog }
