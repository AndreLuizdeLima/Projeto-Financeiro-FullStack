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
  ClienteListItem,
  CreateClienteInput,
  UpdateClienteInput,
} from '@/app/clientes/api/clientes-api'

type ClienteFormModalProps = {
  mode: 'create' | 'edit'
  cliente?: ClienteListItem
  isSaving: boolean
  submissionError?: string
  onClose: () => void
  onSubmit: (values: CreateClienteInput | UpdateClienteInput) => Promise<void>
}

function ClienteFormModal({
  mode,
  cliente,
  isSaving,
  submissionError,
  onClose,
  onSubmit,
}: ClienteFormModalProps) {
  const isCreate = mode === 'create'
  const initialValues = {
    cnpj: cliente?.cnpj ?? '',
    nomeFantasia: cliente?.nomeFantasia ?? '',
    razaoSocial: cliente?.razaoSocial ?? '',
    isActive: cliente?.isActive ?? true,
  }
  const [cnpj, setCnpj] = useState(initialValues.cnpj)
  const [nomeFantasia, setNomeFantasia] = useState(initialValues.nomeFantasia)
  const [razaoSocial, setRazaoSocial] = useState(initialValues.razaoSocial)
  const [isActive, setIsActive] = useState(initialValues.isActive)
  const [validationError, setValidationError] = useState<string>()
  const normalizedValues = {
    cnpj: cnpj.trim(),
    nomeFantasia: nomeFantasia.trim(),
    razaoSocial: razaoSocial.trim(),
  }
  const isDirty =
    !isCreate &&
    (normalizedValues.cnpj !== initialValues.cnpj ||
      normalizedValues.nomeFantasia !== initialValues.nomeFantasia ||
      normalizedValues.razaoSocial !== initialValues.razaoSocial ||
      isActive !== initialValues.isActive)

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
        if (
          !normalizedValues.cnpj ||
          !normalizedValues.nomeFantasia ||
          !normalizedValues.razaoSocial
        ) {
          setValidationError('Preencha todos os campos obrigatórios.')
          return
        }

        setValidationError(undefined)
        await onSubmit(normalizedValues)
        return
      }

      const changes: UpdateClienteInput = {}

      if (normalizedValues.cnpj !== initialValues.cnpj) {
        if (!normalizedValues.cnpj) {
          setValidationError('CNPJ não pode ficar vazio.')
          return
        }
        changes.cnpj = normalizedValues.cnpj
      }

      if (normalizedValues.nomeFantasia !== initialValues.nomeFantasia) {
        if (!normalizedValues.nomeFantasia) {
          setValidationError('Nome fantasia não pode ficar vazio.')
          return
        }
        changes.nomeFantasia = normalizedValues.nomeFantasia
      }

      if (normalizedValues.razaoSocial !== initialValues.razaoSocial) {
        if (!normalizedValues.razaoSocial) {
          setValidationError('Razão social não pode ficar vazia.')
          return
        }
        changes.razaoSocial = normalizedValues.razaoSocial
      }

      if (isActive !== initialValues.isActive) {
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
              Clientes
            </p>
            <DialogTitle className="mt-2 text-2xl tracking-tight">
              {isCreate ? 'Cadastrar cliente' : 'Editar cliente'}
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
            <label className="mb-2 block text-sm font-semibold" htmlFor="cliente-cnpj">
              CNPJ {isCreate ? <span className="text-destructive">*</span> : null}
            </label>
            <Input
              autoFocus
              disabled={isSaving}
              id="cliente-cnpj"
              inputMode="numeric"
              onChange={(event) => {
                clearValidationError()
                setCnpj(event.target.value)
              }}
              required={isCreate}
              value={cnpj}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold" htmlFor="cliente-razao-social">
              Razão social {isCreate ? <span className="text-destructive">*</span> : null}
            </label>
            <Input
              disabled={isSaving}
              id="cliente-razao-social"
              onChange={(event) => {
                clearValidationError()
                setRazaoSocial(event.target.value)
              }}
              required={isCreate}
              value={razaoSocial}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold" htmlFor="cliente-nome-fantasia">
              Nome fantasia {isCreate ? <span className="text-destructive">*</span> : null}
            </label>
            <Input
              disabled={isSaving}
              id="cliente-nome-fantasia"
              onChange={(event) => {
                clearValidationError()
                setNomeFantasia(event.target.value)
              }}
              required={isCreate}
              value={nomeFantasia}
            />
          </div>

          <div className="flex items-center justify-between gap-4 rounded-md border border-border p-4">
            <div>
              <p id="cliente-status-label" className="text-sm font-semibold">
                Cadastro ativo
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {isCreate
                  ? 'Novos clientes são criados como ativos.'
                  : 'Desative ou reative este cliente ao salvar.'}
              </p>
            </div>
            <Switch
              aria-labelledby="cliente-status-label"
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

export { ClienteFormModal }
