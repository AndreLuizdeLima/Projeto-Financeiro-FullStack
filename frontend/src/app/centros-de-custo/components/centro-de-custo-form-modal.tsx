import { type FormEvent, useState } from 'react'
import { PencilLine, Plus, X } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import type {
  CentroDeCustoListItem,
  CreateCentroDeCustoInput,
  UpdateCentroDeCustoInput,
} from '@/app/centros-de-custo/api/centros-de-custo-api'

type CentroDeCustoFormModalProps = {
  mode: 'create' | 'edit'
  centroDeCusto?: CentroDeCustoListItem
  isSaving: boolean
  submissionError?: string
  onClose: () => void
  onSubmit: (
    values: CreateCentroDeCustoInput | UpdateCentroDeCustoInput,
  ) => Promise<void>
}

function CentroDeCustoFormModal({
  mode,
  centroDeCusto,
  isSaving,
  submissionError,
  onClose,
  onSubmit,
}: CentroDeCustoFormModalProps) {
  const isCreate = mode === 'create'
  const initialNome = centroDeCusto?.nome ?? ''
  const initialIsActive = centroDeCusto?.isActive ?? true
  const [nome, setNome] = useState(initialNome)
  const [isActive, setIsActive] = useState(initialIsActive)
  const [validationError, setValidationError] = useState<string>()
  const normalizedNome = nome.trim()
  const isDirty =
    !isCreate &&
    (normalizedNome !== initialNome || isActive !== initialIsActive)

  function clearValidationError() {
    setValidationError(undefined)
  }

  function handleOpenChange(open: boolean) {
    if (!open && !isSaving) {
      onClose()
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    try {
      if (isCreate) {
        if (!normalizedNome) {
          setValidationError('Preencha todos os campos obrigatórios.')
          return
        }

        setValidationError(undefined)
        await onSubmit({ nome: normalizedNome })
        return
      }

      const changes: UpdateCentroDeCustoInput = {}

      if (normalizedNome !== initialNome) {
        if (!normalizedNome) {
          setValidationError('Nome não pode ficar vazio.')
          return
        }
        changes.nome = normalizedNome
      }

      if (isActive !== initialIsActive) {
        changes.isActive = isActive
      }

      setValidationError(undefined)
      await onSubmit(changes)
    } catch {
      // The request error is rendered in the form without closing the modal.
    }
  }

  return (
    <Dialog open onOpenChange={handleOpenChange}>
      <DialogContent className="gap-0 p-0" showCloseButton={false}>
        <header className="flex items-start justify-between gap-5 border-b border-border p-5 sm:p-6">
          <DialogHeader>
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Centros de custo
            </p>
            <DialogTitle className="mt-2 text-2xl tracking-tight">
              {isCreate ? 'Cadastrar centro de custo' : 'Editar centro de custo'}
            </DialogTitle>
            <DialogDescription className="mt-2">
              {isCreate
                ? 'Todos os campos são obrigatórios para criar o cadastro.'
                : 'Altere somente as informações necessárias.'}
            </DialogDescription>
          </DialogHeader>
          <Button
            aria-label="Fechar modal"
            disabled={isSaving}
            onClick={onClose}
            size="icon"
            type="button"
            variant="ghost"
          >
            <X aria-hidden="true" />
          </Button>
        </header>

        <form className="space-y-5 p-5 sm:p-6" noValidate onSubmit={(event) => void handleSubmit(event)}>
          <div>
            <label className="mb-2 block text-sm font-semibold" htmlFor="centro-de-custo-nome">
              Nome {isCreate ? <span className="text-destructive">*</span> : null}
            </label>
            <Input
              autoFocus
              disabled={isSaving}
              id="centro-de-custo-nome"
              onChange={(event) => {
                clearValidationError()
                setNome(event.target.value)
              }}
              required={isCreate}
              value={nome}
            />
          </div>

          <div className="flex items-center justify-between gap-4 rounded-md border border-border p-4">
            <div>
              <p id="centro-de-custo-status-label" className="text-sm font-semibold">
                Cadastro ativo
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {isCreate
                  ? 'Novos cadastros são criados como ativos.'
                  : 'Desative ou reative este centro ao salvar.'}
              </p>
            </div>
            <Switch
              aria-labelledby="centro-de-custo-status-label"
              checked={isActive}
              disabled={isCreate || isSaving}
              onCheckedChange={(checked) => {
                clearValidationError()
                setIsActive(checked)
              }}
            />
          </div>

          {validationError || submissionError ? (
            <p className="rounded-md border border-destructive bg-destructive px-3 py-2 text-sm font-semibold text-destructive-foreground" role="alert">
              {validationError ?? submissionError}
            </p>
          ) : null}

          <DialogFooter className="border-t border-border pt-5">
            <Button disabled={isSaving} onClick={onClose} type="button" variant="outline">
              Cancelar
            </Button>
            <Button disabled={isSaving || (!isCreate && !isDirty)} type="submit">
              {isCreate ? <Plus aria-hidden="true" /> : <PencilLine aria-hidden="true" />}
              {isSaving ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export { CentroDeCustoFormModal }
