import {
  ArrowUpRight,
  Bell,
  CheckCircle2,
  Landmark,
  Plus,
  WalletCards,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { toast } from '@/components/ui/toast'

const statusSignals = [
  {
    name: 'Concluído',
    value: 'bg-positive text-positive-foreground',
    label: 'Confirma que uma operação foi registrada.',
  },
  {
    name: 'Em atenção',
    value: 'bg-warning text-warning-foreground',
    label: 'Indica um item que precisa de conferência.',
  },
  {
    name: 'Impedimento',
    value: 'bg-destructive text-destructive-foreground',
    label: 'Sinaliza uma falha que exige correção.',
  },
]

function DashboardPage() {
  return (
    <section className="mx-auto w-full max-w-6xl">
      <header className="mb-10 flex flex-col gap-6 border-b border-border pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Visão geral
          </h1>
          <p className="mt-4 text-base font-medium text-muted-foreground sm:text-lg">
            Acompanhe os principais indicadores e acesse as ações da operação
            financeira.
          </p>
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="space-y-8" aria-labelledby="actions-title">
          <div>
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Operação
            </p>
            <h2 id="actions-title" className="mt-2 text-2xl font-semibold tracking-tight">
              Ações rápidas
            </h2>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button>
              <Plus aria-hidden="true" />
              Nova movimentação
            </Button>
            <Button variant="outline">
              Ver extrato
              <ArrowUpRight aria-hidden="true" />
            </Button>
            <Button
              variant="secondary"
              onClick={() =>
                toast({
                  title: 'Movimentação salva',
                  description: 'O lançamento foi incluído no período atual.',
                  variant: 'success',
                })
              }
            >
              <CheckCircle2 aria-hidden="true" />
              Testar sucesso
            </Button>
            <Button
              variant="outline"
              size="icon"
              aria-label="Testar notificação"
              onClick={() =>
                toast({
                  title: 'Lembrete contábil',
                  description: 'Há uma conciliação pendente para revisar.',
                  variant: 'warning',
                })
              }
            >
              <Bell aria-hidden="true" />
            </Button>
          </div>

          <Card>
            <CardHeader className="border-b border-border">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardDescription>Saldo consolidado</CardDescription>
                  <CardTitle className="mt-2 text-4xl font-semibold tracking-tight">
                    R$ 24.850,90
                  </CardTitle>
                </div>
                <WalletCards className="size-8" aria-hidden="true" />
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-5 pt-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Variação mensal
                </p>
                <p className="mt-1 text-lg font-semibold text-positive">+ 12,4%</p>
              </div>
              <Button variant="outline" size="sm">
                <Landmark aria-hidden="true" />
                Contas bancárias
              </Button>
            </CardContent>
          </Card>

          <div className="max-w-md">
            <label htmlFor="description" className="mb-2 block text-sm font-bold">
              Descrição do lançamento
            </label>
            <Input id="description" placeholder="Ex.: Recebimento de cliente" />
          </div>
        </section>

        <section aria-labelledby="signals-title">
          <Card className="h-full">
            <CardHeader className="border-b border-border">
              <CardDescription>Sinalização operacional</CardDescription>
              <CardTitle id="signals-title" className="text-2xl font-semibold tracking-tight">
                Estados que exigem contexto
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              {statusSignals.map((signal) => (
                <div
                  key={signal.name}
                  className="flex items-center justify-between rounded-md border border-border p-4"
                >
                  <div>
                    <p className="font-semibold">{signal.name}</p>
                    <p className="mt-1 text-sm leading-5 text-muted-foreground">
                      {signal.label}
                    </p>
                  </div>
                  <span
                    aria-hidden="true"
                    className={`size-8 rounded-md ${signal.value}`}
                  />
                </div>
              ))}
              <p className="pt-2 text-sm leading-6 text-muted-foreground">
                A cor comunica somente o estado da operação: sucesso, atenção
                ou erro.
              </p>
            </CardContent>
          </Card>
        </section>
      </div>
    </section>
  )
}

export { DashboardPage }
