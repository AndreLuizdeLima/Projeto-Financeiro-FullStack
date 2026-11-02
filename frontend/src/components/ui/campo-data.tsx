import { useId, useState } from "react";
import dayjs from "dayjs";
import { CalendarIcon } from "lucide-react";
import { ptBR } from "react-day-picker/locale";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type Props = {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  erro?: string;
};

export const CampoData = ({
  label,
  value,
  onValueChange,
  disabled,
  erro,
}: Props) => {
  const id = useId();
  const [open, setOpen] = useState(false);
  const data = value ? dayjs(value).toDate() : undefined;
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Popover open={open && !disabled} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button
              id={id}
              type="button"
              variant="outline"
              disabled={disabled}
              className="w-full justify-between border-input px-2.5 font-normal"
              aria-invalid={!!erro}
              aria-describedby={erro ? `${id}-erro` : undefined}
            />
          }
        >
          <span>
            {value ? dayjs(value).format("DD/MM/YYYY") : "Selecionar data"}
          </span>
          <CalendarIcon className="text-muted-foreground" />
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="max-h-[70dvh] w-auto max-w-[calc(100vw-2rem)] overflow-auto p-0"
        >
          <Calendar
            mode="single"
            locale={ptBR}
            selected={data}
            defaultMonth={data}
            required
            onSelect={(selecionada) => {
              onValueChange(dayjs(selecionada).format("YYYY-MM-DD"));
              setOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>
      {erro && (
        <span
          id={`${id}-erro`}
          role="alert"
          className="text-sm text-destructive"
        >
          {erro}
        </span>
      )}
    </div>
  );
};
