import { SessionLoader } from '@/components/session-loader'

function SessionLoadingScreen() {
  return (
    <main className="flex min-h-svh items-center justify-center px-5 py-10">
      <section
        className="flex w-full max-w-sm flex-col items-center border-2 border-border bg-card p-8 text-center shadow-[6px_6px_0_var(--shadow-color)]"
        role="status"
        aria-live="polite"
      >
        <SessionLoader />
        <h1 className="mt-8 text-2xl font-black tracking-tight">Restaurando sua sessão...</h1>
        <p className="mt-2 text-sm font-medium text-muted-foreground">
          Validando seu acesso ao sistema financeiro.
        </p>
      </section>
    </main>
  )
}

export { SessionLoadingScreen }
