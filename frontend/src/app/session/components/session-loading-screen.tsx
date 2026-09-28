import { SessionLoader } from '@/app/session/components/session-loader'

function SessionLoadingScreen() {
  return (
    <main className="flex min-h-svh items-center justify-center px-5 py-10">
      <section
        className="flex w-full max-w-sm flex-col items-center rounded-lg border border-border bg-card p-8 text-center"
        role="status"
        aria-live="polite"
      >
        <SessionLoader />
        <h1 className="mt-8 text-2xl font-semibold tracking-tight">Restaurando sua sessão...</h1>
        <p className="mt-2 text-sm font-medium text-muted-foreground">
          Validando seu acesso ao sistema financeiro.
        </p>
      </section>
    </main>
  )
}

export { SessionLoadingScreen }
