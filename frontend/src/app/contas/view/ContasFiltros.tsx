import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ContasPeriodoFiltro } from "./ContasPeriodoFiltro";
import type { ContasViewModel } from "../view-model/useContasViewModel";

export const ContasFiltros = ({ vm }: { vm: ContasViewModel }) => (
  <div
    role="group"
    aria-label="Filtros das contas"
    className="grid grid-cols-1 items-end gap-4 rounded-xl border bg-card p-4 sm:grid-cols-2 2xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.4fr)_minmax(0,1.4fr)_auto]"
  >
    <div className="flex min-w-0 flex-col gap-2">
      <Label htmlFor="contas-situacao">Situação</Label>
      <Select
        items={{
          TODAS: "Todas",
          ABERTA: "Aberta",
          LIQUIDADA: "Liquidada",
          CANCELADA: "Cancelada",
        }}
        value={vm.filtros.situacao || "TODAS"}
        onValueChange={(valor) => {
          if (valor === "TODAS") vm.alterarFiltro("situacao", "");
          else if (
            valor === "ABERTA" ||
            valor === "LIQUIDADA" ||
            valor === "CANCELADA"
          )
            vm.alterarFiltro("situacao", valor);
        }}
      >
        <SelectTrigger id="contas-situacao" className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="TODAS">Todas</SelectItem>
          <SelectItem value="ABERTA">Aberta</SelectItem>
          <SelectItem value="LIQUIDADA">Liquidada</SelectItem>
          <SelectItem value="CANCELADA">Cancelada</SelectItem>
        </SelectContent>
      </Select>
    </div>
    <div className="flex min-w-0 flex-col gap-2">
      <Label htmlFor="contas-vencida">Vencimento</Label>
      <Select
        items={{
          TODAS: "Todas",
          true: "Somente vencidas",
          false: "Sem atraso em aberto",
        }}
        value={vm.filtros.vencida || "TODAS"}
        onValueChange={(valor) => {
          if (valor === "TODAS") vm.alterarFiltro("vencida", "");
          else if (valor === "true" || valor === "false")
            vm.alterarFiltro("vencida", valor);
        }}
      >
        <SelectTrigger id="contas-vencida" className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="TODAS">Todas</SelectItem>
          <SelectItem value="true">Somente vencidas</SelectItem>
          <SelectItem value="false">Sem atraso em aberto</SelectItem>
        </SelectContent>
      </Select>
    </div>
    <ContasPeriodoFiltro
      id="contas-periodo-emissao"
      label="Período de emissão"
      periodo={vm.periodoEmissao}
      texto={vm.periodoEmissaoTexto}
      onSelect={vm.alterarPeriodoEmissao}
      onClear={vm.limparPeriodoEmissao}
      erro={vm.erroEmissao}
    />
    <ContasPeriodoFiltro
      id="contas-periodo"
      label="Período de vencimento"
      periodo={vm.periodo}
      texto={vm.periodoTexto}
      onSelect={vm.alterarPeriodo}
      erro={vm.erroVencimento}
    />
    <Button
      id="adicionar-conta"
      type="button"
      className="sm:col-span-2 sm:justify-self-end 2xl:col-span-1"
      onClick={(event) => vm.adicionarConta(event.currentTarget)}
    >
      <Plus />
      Adicionar conta
    </Button>
    {vm.erroFiltro && (
      <span
        id="contas-erro-filtro"
        role="alert"
        className="text-sm text-destructive sm:col-span-2 2xl:col-span-5"
      >
        {vm.erroFiltro}
      </span>
    )}
  </div>
);
