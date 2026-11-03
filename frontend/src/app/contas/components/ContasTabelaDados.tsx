import { Pencil, Trash } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ContasViewModel } from "../view-model/useContasViewModel";

type Props = {
  titulo: string;
  linhas: ContasViewModel["linhas"];
  onEditar: (id: number, focoRetorno: HTMLElement) => void;
  onCancelar: ContasViewModel["solicitarCancelamento"];
  ocupado: boolean;
};

const colunas = [
  "Descrição",
  "Plano de contas",
  "Centro de custo",
  "Data de emissão",
  "Data de vencimento",
  "Valor",
  "Situação",
  "Ações",
];

export const ContasTabelaDados = ({
  titulo,
  linhas,
  onEditar,
  onCancelar,
  ocupado,
}: Props) => (
  <Table>
    <TableCaption className="sr-only">
      {titulo}, ordenadas por código decrescente.
    </TableCaption>
    <TableHeader>
      <TableRow>
        {colunas.map((titulo) => (
          <TableHead key={titulo} scope="col">
            {titulo}
          </TableHead>
        ))}
      </TableRow>
    </TableHeader>
    <TableBody>
      {linhas.length ? (
        linhas.map((conta) => (
          <TableRow key={conta.id}>
            <TableCell className="min-w-48 max-w-96 whitespace-normal wrap-break-word">
              {conta.descricao}
            </TableCell>
            <TableCell className="min-w-40 max-w-64 whitespace-normal wrap-break-word">
              {conta.planoDeContaNome}
            </TableCell>
            <TableCell className="min-w-36 max-w-64 whitespace-normal wrap-break-word">
              {conta.centroDeCustoNome}
            </TableCell>
            <TableCell>{conta.emissao}</TableCell>
            <TableCell>{conta.vencimento}</TableCell>
            <TableCell className="tabular-nums">{conta.valor}</TableCell>
            <TableCell>
              <Badge
                variant={
                  conta.vencidaEmAberto
                    ? "destructive"
                    : conta.situacao === "ABERTA"
                      ? "outline"
                      : "secondary"
                }
              >
                {conta.situacaoTexto}
              </Badge>
            </TableCell>
            <TableCell>
              {conta.situacao === "ABERTA" && (
                <div
                  className="flex gap-1"
                  role="group"
                  aria-label={`Ações da conta #${conta.id}`}
                >
                  <Button
                    type="button"
                    variant="outline"
                    size="icon-sm"
                    disabled={ocupado}
                    aria-label={`Editar conta #${conta.id}`}
                    title="Editar conta"
                    onClick={(event) => onEditar(conta.id, event.currentTarget)}
                  >
                    <Pencil />
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon-sm"
                    disabled={ocupado}
                    aria-label={`Cancelar conta #${conta.id}`}
                    title="Cancelar conta"
                    onClick={(event) => onCancelar(conta, event.currentTarget)}
                  >
                    <Trash />
                  </Button>
                </div>
              )}
            </TableCell>
          </TableRow>
        ))
      ) : (
        <TableRow>
          <TableCell
            colSpan={colunas.length}
            className="h-32 text-center text-muted-foreground"
          >
            Nenhuma conta encontrada para os filtros aplicados.
          </TableCell>
        </TableRow>
      )}
    </TableBody>
  </Table>
);
