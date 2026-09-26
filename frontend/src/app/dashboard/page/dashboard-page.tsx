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

const colors = [
  { name: 'Base', value: 'bg-background text-foreground', label: 'Fundo' },
  { name: 'Primary', value: 'bg-primary text-primary-foreground', label: 'Ação' },
  { name: 'Positive', value: 'bg-positive text-positive-foreground', label: 'Receita' },
  { name: 'Warning', value: 'bg-warning text-warning-foreground', label: 'Atenção' },
  { name: 'Destructive', value: 'bg-destructive text-destructive-foreground', label: 'Erro' },
]

function DashboardPage() {
  return (
    <section className="mx-auto w-full max-w-6xl">
      <header className="mb-12 flex flex-col gap-6 border-b-2 border-border pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-black tracking-[-0.06em] sm:text-6xl">
            Visão geral.
          </h1>
          <p className="mt-4 text-base font-medium text-muted-foreground sm:text-lg">
            Tailwind, shadcn/ui, ícones e notificações prontos para as primeiras
            telas contábeis.
          </p>
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="space-y-8" aria-labelledby="components-title">
          <div>
            <p className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
              Componentes
            </p>
            <h2 id="components-title" className="mt-2 text-2xl font-black tracking-tight">
              Ações e feedback
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
            <CardHeader className="border-b-2 border-border">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardDescription>Saldo consolidado</CardDescription>
                  <CardTitle className="mt-2 text-4xl font-black tracking-tight">
                    R$ 24.850,90
                  </CardTitle>
                </div>
                <WalletCards className="size-8" aria-hidden="true" />
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-5 pt-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
                  Variação mensal
                </p>
                <p className="mt-1 text-lg font-black text-positive">+ 12,4%</p>
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

        <section aria-labelledby="tokens-title">
          <Card className="h-full">
            <CardHeader className="border-b-2 border-border">
              <CardDescription>Tokens semânticos</CardDescription>
              <CardTitle id="tokens-title" className="text-2xl font-black tracking-tight">
                Preto, branco e sinal.
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              {colors.map((color) => (
                <div
                  key={color.name}
                  className="flex items-center justify-between border-2 border-border p-3"
                >
                  <div>
                    <p className="font-bold">{color.name}</p>
                    <p className="text-sm text-muted-foreground">{color.label}</p>
                  </div>
                  <span className={`size-10 border-2 border-border ${color.value}`} />
                </div>
              ))}
              <p className="pt-2 text-sm leading-6 text-muted-foreground">
                A cor só comunica estado: verde para positivo, âmbar para atenção
                e vermelho para erro.
              </p>
            </CardContent>
          </Card>
        </section>
      </div>
    </section>
  )
}

export { DashboardPage }
