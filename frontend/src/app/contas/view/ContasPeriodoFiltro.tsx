import type { DateRange } from "react-day-picker";
import { ptBR } from "react-day-picker/locale";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type Props = {
  id: string;
  label: string;
  periodo: DateRange;
  texto: string;
  onSelect: (periodo: DateRange | undefined) => void;
  erro?: string;
  onClear?: () => void;
};

export const ContasPeriodoFiltro = ({
  id,
  label,
  periodo,
  texto,
  onSelect,
  erro,
  onClear,
}: Props) => (
  <div className="flex min-w-0 flex-col gap-2">
    <Label htmlFor={id}>{label}</Label>
    <Popover>
      <PopoverTrigger
        render={
          <Button
            id={id}
            type="button"
            variant="outline"
            className="w-full min-w-0 justify-start border-input px-2.5 font-normal"
            aria-invalid={!!erro}
            aria-describedby={erro ? "contas-erro-filtro" : undefined}
          />
        }
      >
        <CalendarIcon className="text-muted-foreground" />
        <span className="min-w-0 truncate">{texto}</span>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="max-h-[70dvh] w-auto max-w-[calc(100vw-2rem)] overflow-auto p-0"
      >
        <Calendar
          mode="range"
          locale={ptBR}
          defaultMonth={periodo.from}
          selected={periodo}
          onSelect={onSelect}
          numberOfMonths={2}
        />
        {onClear && (
          <div className="border-t p-2">
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={onClear}
            >
              Remover período de emissão
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  </div>
);
