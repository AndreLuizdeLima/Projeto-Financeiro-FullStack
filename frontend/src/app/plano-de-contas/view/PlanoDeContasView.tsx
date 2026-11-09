import {
  ChevronRight,
  ChevronDown,
  Eye,
  Pencil,
  Plus,
  RotateCcw,
  Ban,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Campo } from "@/app/cadastros/view/Campo";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { tipos } from "../model/plano-de-contas";
import type { NoPlano } from "../model/hierarquia";
import type { PlanoDeContasVM } from "../view-model/usePlanoDeContasViewModel";
import { PlanoModal } from "./PlanoModal";
import { PlanoFormulario } from "./PlanoFormulario";
import { NaturezaBadge } from "./NaturezaBadge";

function Filtro({
  id,
  label,
  value,
  opcoes,
  alterar,
}: {
  id: string;
  label: string;
  value: string;
  opcoes: Record<string, string>;
  alterar: (v: string) => void;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Select
        value={value}
        onValueChange={(v) => {
          if (v) alterar(v);
        }}
      >
        <SelectTrigger id={id}>
          <SelectValue>{opcoes[value]}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {Object.entries(opcoes).map(([v, texto]) => (
            <SelectItem key={v} value={v}>
              {texto}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
function Linha({ no, vm }: { no: NoPlano; vm: PlanoDeContasVM }) {
  const c = no.conta,
    aberto = vm.filtrando || vm.expansao.has(c.id);
  const contexto = vm.filtrando && !vm.correspondentes.has(c.id);
  return (
    <tr className="border-b last:border-0">
      <td className="px-4 py-3 font-mono whitespace-nowrap">{c.codigo}</td>
      <th scope="row" className="px-4 py-3 text-left font-normal">
        <div
          className="flex min-w-56 items-center gap-2"
          style={{ paddingLeft: no.valido ? (no.nivel - 1) * 20 : 0 }}
        >
          {no.filhos.length ? (
            <Button
              size="icon-sm"
              variant="ghost"
              aria-label={`${aberto ? "Recolher" : "Expandir"} ${c.codigo} ${c.nome}`}
              aria-expanded={aberto}
              disabled={vm.filtrando}
              onClick={() => vm.alternar(no)}
            >
              {aberto ? <ChevronDown /> : <ChevronRight />}
            </Button>
          ) : (
            <span className="w-7 shrink-0" />
          )}
          <span className="wrap-break-word">
            {c.nome}
            {contexto && (
              <span className="ml-2 text-xs text-muted-foreground">
                Contexto
              </span>
            )}
          </span>
        </div>
      </th>
      <td className="px-4 py-3">{tipos[c.tipo]}</td>
      <td className="px-4 py-3">
        <NaturezaBadge natureza={c.natureza} />
      </td>
      <td className="px-4 py-3">
        <Badge variant={c.isActive ? "success" : "error"}>
          {c.isActive ? "Ativa" : "Inativa"}
        </Badge>
      </td>
      <td className="px-4 py-3">
        <div
          className="flex gap-1"
          role="group"
          aria-label={`Ações de ${c.codigo} ${c.nome}`}
        >
          <Button
            size="icon-sm"
            variant="outline"
            title="Visualizar"
            aria-label={`Visualizar ${c.codigo}`}
            disabled={vm.ocupado}
            onClick={() => void vm.abrir("consultar", c)}
          >
            <Eye />
          </Button>
          <Button
            size="icon-sm"
            title="Editar"
            aria-label={`Editar ${c.codigo}`}
            disabled={vm.ocupado}
            onClick={() => void vm.abrir("editar", c)}
          >
            <Pencil />
          </Button>
          {no.valido && no.nivel < 10 && (
            <Button
              size="icon-sm"
              variant="outline"
              title="Adicionar filha"
              aria-label={`Adicionar filha a ${c.codigo}`}
              disabled={vm.ocupado}
              onClick={() => void vm.abrir("criar", undefined, c.id)}
            >
              <Plus />
            </Button>
          )}
          {c.isActive ? (
            <Button
              size="icon-sm"
              variant="destructive"
              title="Inativar"
              aria-label={`Inativar ${c.codigo}`}
              disabled={vm.ocupado}
              onClick={() => vm.confirmar(c)}
            >
              <Ban />
            </Button>
          ) : (
            <Button
              size="icon-sm"
              variant="outline"
              title="Reativar"
              aria-label={`Reativar ${c.codigo}`}
              disabled={vm.ocupado}
              onClick={() => void vm.reativar(c)}
            >
              <RotateCcw />
            </Button>
          )}
        </div>
      </td>
    </tr>
  );
}
export function PlanoDeContasView({ vm }: { vm: PlanoDeContasVM }) {
  const regulares = vm.linhas.filter((n) => n.valido),
    inconsistentes = vm.linhas.filter((n) => !n.valido);
  return (
    <section className="flex min-w-0 flex-col gap-5 p-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Plano de contas</h1>
          <p className="text-sm text-muted-foreground">
            Organize as contas pela hierarquia de ativos, passivos, receitas e
            despesas.
          </p>
        </div>
        <Button
          disabled={vm.carregando || !!vm.erro || vm.ocupado || !vm.pais.length}
          onClick={() => void vm.abrir("criar")}
        >
          <Plus />
          Nova conta
        </Button>
      </header>
      <div className="grid grid-cols-1 items-end gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,1fr)_auto]">
        <div className="min-w-0 sm:col-span-2 lg:col-span-1">
          <Campo
            label="Buscar por código ou nome"
            value={vm.busca}
            onChange={(e) => vm.alterarBusca(e.target.value)}
            placeholder="Pesquisar contas…"
          />
        </div>
        <Filtro
          id="plano-filtro-tipo"
          label="Tipo"
          value={vm.tipo}
          alterar={vm.setTipo}
          opcoes={{ todos: "Todos", ...tipos }}
        />
        <Filtro
          id="plano-filtro-situacao"
          label="Situação"
          value={vm.situacao}
          alterar={vm.setSituacao}
          opcoes={{ todos: "Todas", ativos: "Ativas", inativos: "Inativas" }}
        />
        <Button
          variant="outline"
          className="sm:col-span-2 lg:col-span-1"
          disabled={!vm.podeAlternarTudo}
          aria-pressed={vm.tudoExpandido}
          onClick={vm.alternarTudo}
        >
          {vm.tudoExpandido ? <ChevronDown /> : <ChevronRight />}
          {vm.tudoExpandido ? "Recolher tudo" : "Expandir tudo"}
        </Button>
      </div>
      {vm.filtrando && (
        <p className="text-sm text-muted-foreground">
          Os caminhos dos resultados estão expandidos. Ancestrais fora do filtro
          aparecem como contexto.
        </p>
      )}
      {vm.codigoRevelado && vm.filtrando && (
        <p className="text-sm text-muted-foreground">
          A conta recém-criada e seu caminho também aparecem até a próxima
          alteração dos filtros.
        </p>
      )}
      <div className="min-w-0 rounded-xl border bg-card">
        {vm.carregando ? (
          <div
            role="status"
            className="flex items-center justify-center gap-2 p-10"
          >
            <Spinner />
            Carregando plano de contas…
          </div>
        ) : vm.erro ? (
          <div role="alert" className="flex flex-col items-center gap-3 p-8">
            <p>
              {vm.aposGravacao
                ? "A alteração foi salva, mas não foi possível atualizar a listagem. Tente carregar novamente."
                : "Não foi possível carregar o plano de contas."}
            </p>
            <p>{vm.erro}</p>
            <Button variant="outline" onClick={vm.recarregar}>
              Tentar novamente
            </Button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <caption className="sr-only">
                  Plano de contas organizado por código hierárquico
                </caption>
                <thead className="border-b bg-muted">
                  <tr>
                    {[
                      "Código",
                      "Nome",
                      "Tipo",
                      "Natureza",
                      "Situação",
                      "Ações",
                    ].map((t) => (
                      <th key={t} scope="col" className="px-4 py-3 font-medium">
                        {t}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {regulares.map((no) => (
                    <Linha key={no.conta.id} no={no} vm={vm} />
                  ))}
                  {!!inconsistentes.length && (
                    <tr>
                      <th colSpan={6} className="bg-muted px-4 py-3 text-left">
                        Hierarquia inconsistente{" "}
                        <span className="font-normal">
                          · Contas sem vínculo identificável pelo código;
                          indisponíveis como pai.
                        </span>
                      </th>
                    </tr>
                  )}
                  {inconsistentes.map((no) => (
                    <Linha key={no.conta.id} no={no} vm={vm} />
                  ))}
                  {!vm.linhas.length && (
                    <tr>
                      <td
                        colSpan={6}
                        className="p-8 text-center text-muted-foreground"
                      >
                        {vm.arvore.nos.length
                          ? "Nenhuma conta corresponde aos filtros."
                          : "Nenhuma conta cadastrada. As quatro raízes precisam existir no sistema para cadastrar contas filhas."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <footer className="border-t p-4 text-sm text-muted-foreground">
              {vm.arvore.nos.length} contas carregadas · {vm.linhas.length}{" "}
              linhas visíveis
            </footer>
          </>
        )}
      </div>
      {vm.erroAcao && !vm.modal && !vm.confirmacao && (
        <p role="alert" className="text-sm text-destructive">
          {vm.erroAcao}
        </p>
      )}
      {vm.modal && (
        <PlanoModal
          titulo={
            vm.modal.modo === "criar"
              ? "Nova conta"
              : vm.modal.modo === "editar"
                ? "Editar conta"
                : "Consultar conta"
          }
          descricao="Dados e posição da conta no plano de contas."
          exibirFechar={vm.modal.carregando || !!vm.modal.erro}
          ocupado={vm.ocupado}
          fechar={vm.fechar}
        >
          {vm.modal.carregando ? (
            <div role="status" className="flex items-center gap-2">
              <Spinner />
              Carregando conta…
            </div>
          ) : vm.modal.erro ? (
            <div role="alert" className="flex flex-col gap-3">
              <p>{vm.modal.erro}</p>
              <Button
                onClick={() => void vm.abrir(vm.modal!.modo, vm.modal!.conta)}
              >
                Tentar novamente
              </Button>
            </div>
          ) : (
            <PlanoFormulario
              key={`${vm.modal.modo}-${vm.modal.conta?.id ?? vm.modal.paiId ?? "nova"}`}
              vm={vm}
            />
          )}
          {vm.erroAcao && (
            <p role="alert" className="mt-3 text-sm text-destructive">
              {vm.erroAcao}
            </p>
          )}
        </PlanoModal>
      )}
      {vm.confirmacao && (
        <PlanoModal
          titulo="Inativar conta"
          descricao={`Inativar “${vm.confirmacao.codigo} · ${vm.confirmacao.nome}”? A conta e seus vínculos serão preservados. Os filhos manterão seus próprios status.`}
          ocupado={vm.ocupado}
          fechar={vm.fechar}
        >
          <Button
            variant="destructive"
            disabled={vm.ocupado}
            onClick={() => void vm.inativar()}
          >
            {vm.ocupado ? "Inativando…" : "Confirmar inativação"}
          </Button>
          {vm.erroAcao && (
            <p role="alert" className="mt-3 text-sm text-destructive">
              {vm.erroAcao}
            </p>
          )}
        </PlanoModal>
      )}
    </section>
  );
}
