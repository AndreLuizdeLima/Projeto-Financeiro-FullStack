import { type FormEvent, type MouseEvent } from "react";
import {
  KeyRound,
  Mail,
  PencilLine,
  UserPlus,
  UserRound,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { UserListItem } from "@/app/users/api/users-api";
import type { UserFormValues } from "@/app/users/model/user-form-values";
import { useUserFormViewModel } from "@/app/users/view-model/use-user-form-view-model";

type UserFormModalProps = {
  mode: "create" | "edit";
  user?: UserListItem;
  isSaving: boolean;
  submissionError?: string;
  onClose: () => void;
  onSubmit: (values: UserFormValues) => Promise<void>;
};

function UserFormModal({
  mode,
  user,
  isSaving,
  submissionError,
  onClose,
  onSubmit,
}: UserFormModalProps) {
  const form = useUserFormViewModel({ mode, user, onSubmit });
  const title = form.isCreate ? "Cadastrar usuário" : "Editar usuário";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      await form.submit();
    } catch {
      // The request error is rendered in the form without closing the modal.
    }
  }

  function handleBackdropMouseDown(event: MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget && !isSaving) {
      onClose();
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-foreground/35 p-4"
      onMouseDown={handleBackdropMouseDown}
    >
      <section
        aria-labelledby="user-form-title"
        aria-modal="true"
        className="w-full max-w-lg border-2 border-border bg-card shadow-[6px_6px_0_var(--shadow-color)]"
        role="dialog"
      >
        <header className="flex items-start justify-between gap-5 border-b-2 border-border p-5 sm:p-6">
          <div>
            <p className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
              Cadastro de usuários
            </p>
            <h2
              id="user-form-title"
              className="mt-2 text-2xl font-black tracking-tight"
            >
              {title}
            </h2>
          </div>
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

        <form
          className="space-y-5 p-5 sm:p-6"
          noValidate
          onSubmit={handleSubmit}
        >
          <div>
            <label
              className="mb-2 flex items-center gap-2 text-sm font-bold"
              htmlFor="user-name"
            >
              <UserRound aria-hidden="true" className="size-4" />
              Nome
            </label>
            <Input
              autoFocus
              disabled={isSaving}
              id="user-name"
              onChange={(event) => form.setNome(event.target.value)}
              required
              value={form.nome}
            />
          </div>

          <div>
            <label
              className="mb-2 flex items-center gap-2 text-sm font-bold"
              htmlFor="user-email"
            >
              <Mail aria-hidden="true" className="size-4" />
              E-mail
            </label>
            <Input
              autoComplete="email"
              disabled={isSaving}
              id="user-email"
              onChange={(event) => form.setEmail(event.target.value)}
              required
              type="email"
              value={form.email}
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label
                className="mb-2 flex items-center gap-2 text-sm font-bold"
                htmlFor="user-password"
              >
                <KeyRound aria-hidden="true" className="size-4" />
                Senha {form.isCreate ? "" : "(opcional)"}
              </label>
              <Input
                autoComplete={form.isCreate ? "new-password" : "off"}
                disabled={isSaving}
                id="user-password"
                onChange={(event) => form.setPassword(event.target.value)}
                required={form.isCreate}
                type="password"
                value={form.password}
              />
            </div>

            {form.shouldConfirmPassword ? (
              <div>
                <label
                  className="mb-2 block text-sm font-bold"
                  htmlFor="user-password-confirmation"
                >
                  Confirmar senha
                </label>
                <Input
                  autoComplete="off"
                  disabled={isSaving}
                  id="user-password-confirmation"
                  onChange={(event) =>
                    form.setConfirmPassword(event.target.value)
                  }
                  required
                  type="password"
                  value={form.confirmPassword}
                />
              </div>
            ) : null}
          </div>

          {form.validationError || submissionError ? (
            <p
              className="border-2 border-destructive bg-destructive px-3 py-2 text-sm font-bold text-destructive-foreground"
              role="alert"
            >
              {form.validationError ?? submissionError}
            </p>
          ) : null}

          <div className="flex flex-col-reverse gap-3 border-t-2 border-border pt-5 sm:flex-row sm:justify-end">
            <Button
              disabled={isSaving}
              onClick={onClose}
              type="button"
              variant="outline"
            >
              Cancelar
            </Button>
            <Button disabled={isSaving} type="submit">
              {form.isCreate ? (
                <UserPlus aria-hidden="true" />
              ) : (
                <PencilLine aria-hidden="true" />
              )}
              {isSaving ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}

export { UserFormModal };
