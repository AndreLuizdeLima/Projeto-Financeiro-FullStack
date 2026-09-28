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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import type {
  ContaBancariaListItem,
  CreateContaBancariaInput,
  TipoDeContaBancaria,
  UpdateContaBancariaInput,
} from '@/app/contas-bancarias/api/contas-bancarias-api'
import {
  tipoDeContaBancariaLabels,
  tiposDeContaBancaria,
} from '@/app/contas-bancarias/api/contas-bancarias-api'

type ContaBancariaFormModalProps = {
  mode: 'create' | 'edit'
  contaBancaria?: ContaBancariaListItem
  isSaving: boolean
  submissionError?: string
  onClose: () => void
  onSubmit: (
    values: CreateContaBancariaInput | UpdateContaBancariaInput,
  ) => Promise<void>
}

function ContaBancariaFormModal({
  mode,
  contaBancaria,
  isSaving,
  submissionError,
  onClose,
  onSubmit,
}: ContaBancariaFormModalProps) {
  const isCreate = mode === 'create'
  const initialTipo: TipoDeContaBancaria | '' = contaBancaria?.tipo ?? ''
  const initialValues = {
    conta: contaBancaria?.conta ?? '',
    nome: contaBancaria?.nome ?? '',
    tipo: initialTipo,
    isActive: contaBancaria?.isActive ?? true,
  }
  const [conta, setConta] = useState(initialValues.conta)
  const [nome, setNome] = useState(initialValues.nome)
  const [tipo, setTipo] = useState<TipoDeContaBancaria | ''>(initialValues.tipo)
  const [isActive, setIsActive] = useState(initialValues.isActive)
  const [validationError, setValidationError] = useState<string>()
  const normalizedValues = {
    conta: conta.trim(),
    nome: nome.trim(),
    tipo,
  }
  const isDirty =
    !isCreate &&
    (normalizedValues.conta !== initialValues.conta ||
      normalizedValues.nome !== initialValues.nome ||
      normalizedValues.tipo !== initialValues.tipo ||
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
          !normalizedValues.conta ||
          !normalizedValues.nome ||
          !normalizedValues.tipo
        ) {
          setValidationError('Preencha todos os campos obrigatórios.')
          return
        }

        setValidationError(undefined)
        await onSubmit({
          conta: normalizedValues.conta,
          nome: normalizedValues.nome,
          tipo: normalizedValues.tipo,
        })
        return
      }

      const changes: UpdateContaBancariaInput = {}

      if (normalizedValues.conta !== initialValues.conta) {
        if (!normalizedValues.conta) {
          setValidationError('Conta não pode ficar vazia.')
          return
        }
        changes.conta = normalizedValues.conta
      }

      if (normalizedValues.nome !== initialValues.nome) {
        if (!normalizedValues.nome) {
          setValidationError('Nome não pode ficar vazio.')
          return
        }
        changes.nome = normalizedValues.nome
      }

      if (normalizedValues.tipo !== initialValues.tipo) {
        changes.tipo = normalizedValues.tipo as TipoDeContaBancaria
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
              Contas bancárias
            </p>
            <DialogTitle className="mt-2 text-2xl tracking-tight">
              {isCreate ? 'Cadastrar conta bancária' : 'Editar conta bancária'}
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
            <label className="mb-2 block text-sm font-semibold" htmlFor="conta-bancaria-nome">
              Nome {isCreate ? <span className="text-destructive">*</span> : null}
            </label>
            <Input
              autoFocus
              disabled={isSaving}
              id="conta-bancaria-nome"
              onChange={(event) => {
                clearValidationError()
                setNome(event.target.value)
              }}
              required={isCreate}
              value={nome}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold" htmlFor="conta-bancaria-conta">
              Conta {isCreate ? <span className="text-destructive">*</span> : null}
            </label>
            <Input
              disabled={isSaving}
              id="conta-bancaria-conta"
              onChange={(event) => {
                clearValidationError()
                setConta(event.target.value)
              }}
              required={isCreate}
              value={conta}
            />
          </div>

          <div>
            <label id="conta-bancaria-tipo-label" className="mb-2 block text-sm font-semibold">
              Tipo {isCreate ? <span className="text-destructive">*</span> : null}
            </label>
            <Select
              disabled={isSaving}
              onValueChange={(value) => {
                clearValidationError()
                setTipo(value as TipoDeContaBancaria)
              }}
              value={tipo}
            >
              <SelectTrigger aria-labelledby="conta-bancaria-tipo-label" className="w-full">
                <SelectValue placeholder="Selecione o tipo de conta" />
              </SelectTrigger>
              <SelectContent>
                {tiposDeContaBancaria.map((tipoDeConta) => (
                  <SelectItem key={tipoDeConta} value={tipoDeConta}>
                    {tipoDeContaBancariaLabels[tipoDeConta]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between gap-4 rounded-md border border-border p-4">
            <div>
              <p id="conta-bancaria-status-label" className="text-sm font-semibold">
                Cadastro ativo
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {isCreate
                  ? 'Novas contas são criadas como ativas.'
                  : 'Desative ou reative esta conta ao salvar.'}
              </p>
            </div>
            <Switch
              aria-labelledby="conta-bancaria-status-label"
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

export { ContaBancariaFormModal }
