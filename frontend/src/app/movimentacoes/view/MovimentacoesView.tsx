import {
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowLeftRight,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination";
import { SeletorPesquisavel } from "@/components/ui/seletor-pesquisavel";
import CardInfoIcon from "@/components/CardInfoIcon";
import { ContasPeriodoFiltro } from "@/app/contas/view/ContasPeriodoFiltro";
import { tipos, origens } from "../model/movimentacoes";
import type { MovimentacoesViewModel } from "../view-model/useMovimentacoesViewModel";
import { LancamentoModal } from "./LancamentoModal";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Plus } from "lucide-react";
import { MovimentoDetalhesModal } from "./MovimentoDetalhesModal";

export const MovimentacoesView = ({ vm }: { vm: MovimentacoesViewModel }) => (
  <section className="flex min-w-0 flex-col gap-5 p-4">
    <h1 className="text-2xl font-semibold">Movimentações financeiras</h1>
    <div
      role="group"
      aria-label="Filtros das movimentações"
      className="grid grid-cols-1 items-end gap-4 rounded-xl border bg-card p-4 sm:grid-cols-2 2xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.2fr)_auto]"
    >
      <ContasPeriodoFiltro
        id="movimentacoes-periodo"
        label="Período da movimentação"
        periodo={vm.periodo}
        texto={vm.periodoTexto}
        onSelect={vm.alterarPeriodo}
        erro={vm.erroPeriodo}
      />
      <div className="flex min-w-0 flex-col gap-2">
        <Label htmlFor="movimentacoes-tipo">Tipo</Label>
        <Select
          items={{ TODOS: "Todos", ...tipos }}
          value={vm.filtros.tipo || "TODOS"}
          onValueChange={(v) => {
            if (v === "TODOS") vm.alterarFiltro("tipo", "");
            else if (v === "ENTRADA" || v === "SAIDA" || v === "TRANSFERENCIA")
              vm.alterarFiltro("tipo", v);
          }}
        >
          <SelectTrigger id="movimentacoes-tipo" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="TODOS">Todos</SelectItem>
            {Object.entries(tipos).map(([v, label]) => (
              <SelectItem key={v} value={v}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex min-w-0 flex-col gap-2">
        <Label htmlFor="movimentacoes-origem">Origem</Label>
        <Select
          items={{ TODAS: "Todas", ...origens }}
          value={vm.filtros.origem || "TODAS"}
          onValueChange={(v) => {
            if (v === "TODAS") vm.alterarFiltro("origem", "");
            else if (
              v === "AVULSA" ||
              v === "SALDO_INICIAL" ||
              v === "LIQUIDACAO" ||
              v === "ESTORNO"
            )
              vm.alterarFiltro("origem", v);
          }}
        >
          <SelectTrigger id="movimentacoes-origem" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="TODAS">Todas</SelectItem>
            {Object.entries(origens).map(([v, label]) => (
              <SelectItem key={v} value={v}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <SeletorPesquisavel
        label="Conta bancária (todas se vazio)"
        opcoes={vm.opcoesBancos}
        value={vm.filtros.contaBancariaId}
        onValueChange={(id) => vm.alterarFiltro("contaBancariaId", id)}
        opcional
        permitirInativos
        disabled={vm.bancos.carregando || !!vm.bancos.erro}
      />
      <div className="sm:col-span-2 sm:justify-self-end 2xl:col-span-1">
        <Popover open={vm.menuLancamento} onOpenChange={vm.setMenuLancamento}>
          <PopoverTrigger
            render={
              <Button
                id="lancar-movimentacao"
                type="button"
                className="w-full"
              />
            }
          >
            <Plus />
            Lançar
          </PopoverTrigger>
          <PopoverContent align="end" className="w-48 p-1">
            <div
              role="group"
              aria-label="Tipo de lançamento"
              className="flex flex-col"
            >
              <Button
                variant="ghost"
                className="justify-start"
                onClick={() => vm.abrirLancamento("ENTRADA")}
              >
                <ArrowDownToLine />
                Entrada
              </Button>
              <Button
                variant="ghost"
                className="justify-start"
                onClick={() => vm.abrirLancamento("SAIDA")}
              >
                <ArrowUpFromLine />
                Saída
              </Button>
              <Button
                variant="ghost"
                className="justify-start"
                onClick={() => vm.abrirLancamento("TRANSFERENCIA")}
              >
                <ArrowLeftRight />
                Transferência
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      {vm.erroPeriodo && (
        <p
          id="contas-erro-filtro"
          role="alert"
          className="text-sm text-destructive sm:col-span-2 2xl:col-span-5"
        >
          {vm.erroPeriodo}
        </p>
      )}
      {vm.bancos.erro && (
        <div
          role="alert"
          className="flex flex-wrap items-center gap-2 text-sm sm:col-span-2 2xl:col-span-5"
        >
          <span>
            Não foi possível carregar as contas bancárias: {vm.bancos.erro}
          </span>
          <Button variant="outline" onClick={vm.bancos.recarregar}>
            Tentar novamente
          </Button>
        </div>
      )}
    </div>
    <div
      aria-label="Resumo das movimentações filtradas"
      className="grid gap-4 md:grid-cols-3"
    >
      <CardInfoIcon
        title="Entradas"
        value={vm.resumo.erro ? "—" : vm.totais.ENTRADA}
        color="green"
        icon={<ArrowDownToLine />}
        loading={vm.resumo.carregando}
      />
      <CardInfoIcon
        title="Saídas"
        value={vm.resumo.erro ? "—" : vm.totais.SAIDA}
        color="red"
        icon={<ArrowUpFromLine />}
        loading={vm.resumo.carregando}
      />
      <CardInfoIcon
        title="Transferências"
        value={vm.resumo.erro ? "—" : vm.totais.TRANSFERENCIA}
        color="blue"
        icon={<ArrowLeftRight />}
        loading={vm.resumo.carregando}
      />
    </div>
    {vm.resumo.erro && (
      <div role="alert" className="flex flex-wrap items-center gap-3">
        <span>Não foi possível carregar o resumo: {vm.resumo.erro}</span>
        <Button variant="outline" onClick={vm.resumo.recarregar}>
          Tentar novamente
        </Button>
      </div>
    )}
    <div
      className="min-w-0 overflow-hidden rounded-xl border bg-card"
      aria-busy={vm.lista.carregando}
    >
      {vm.lista.carregando ? (
        <div
          role="status"
          className="flex items-center justify-center gap-2 p-10"
        >
          <Spinner />
          Carregando movimentações…
        </div>
      ) : vm.lista.erro ? (
        <div role="alert" className="flex flex-col items-center gap-3 p-8">
          <span>{vm.lista.erro}</span>
          <Button variant="outline" onClick={vm.lista.recarregar}>
            Tentar novamente
          </Button>
        </div>
      ) : (
        <>
          <Table>
            <caption className="sr-only">
              Movimentações financeiras do período selecionado
            </caption>
            <TableHeader>
              <TableRow>
                {[
                  "Data",
                  "Descrição",
                  "Tipo",
                  "Origem",
                  "Conta de origem",
                  "Conta de destino",
                  "Valor",
                  "Ações",
                ].map((c) => (
                  <TableHead
                    key={c}
                    className={c === "Valor" ? "text-right" : ""}
                  >
                    {c}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {!vm.linhas.length && (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="p-10 text-center text-muted-foreground"
                  >
                    Nenhuma movimentação encontrada para os filtros
                    selecionados.
                  </TableCell>
                </TableRow>
              )}
              {vm.linhas.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="whitespace-nowrap">
                    {m.dataTexto}
                  </TableCell>
                  <TableCell className="min-w-48 max-w-sm whitespace-normal wrap-break-word">
                    {m.descricao}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-medium whitespace-nowrap text-white ${m.tipo === "ENTRADA" ? "bg-green-700" : m.tipo === "SAIDA" ? "bg-red-700" : "bg-blue-700"}`}
                    >
                      {m.tipoTexto}
                    </span>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {m.origemTexto}
                  </TableCell>
                  <TableCell>{m.bancoOrigem}</TableCell>
                  <TableCell>{m.bancoDestino}</TableCell>
                  <TableCell className="text-right whitespace-nowrap tabular-nums">
                    {m.valorTexto}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Consultar movimentação #${m.id}`}
                      onClick={(e) => vm.abrirDetalhes(m.id, e.currentTarget)}
                    >
                      <Eye />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <footer className="flex flex-wrap items-center justify-between gap-3 border-t p-4">
            <span className="text-sm text-muted-foreground" aria-live="polite">
              Página {vm.page} · {vm.lista.dados?.meta.total ?? 0} registros
            </span>
            <Pagination
              className="mx-0 w-auto"
              aria-label="Paginação das movimentações"
            >
              <PaginationContent>
                <PaginationItem>
                  <Button
                    variant="outline"
                    disabled={vm.page === 1}
                    onClick={() => vm.mudarPagina(vm.page - 1)}
                  >
                    Anterior
                  </Button>
                </PaginationItem>
                <PaginationItem>
                  <Button
                    variant="outline"
                    disabled={!vm.lista.dados?.meta.hasNextPage}
                    onClick={() => vm.mudarPagina(vm.page + 1)}
                  >
                    Próxima
                  </Button>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </footer>
        </>
      )}
    </div>
    {vm.lancamento && (
      <LancamentoModal
        tipo={vm.lancamento.tipo}
        focoRetorno={vm.lancamento.focoRetorno}
        fechar={vm.fecharLancamento}
        aoSalvar={vm.lancamentoSalvo}
      />
    )}
    {vm.modal && (
      <MovimentoDetalhesModal
        key={vm.modal.id}
        id={vm.modal.id}
        focoRetorno={vm.modal.focoRetorno}
        bancos={vm.bancos.dados}
        fechar={vm.fecharDetalhes}
      />
    )}
  </section>
);
