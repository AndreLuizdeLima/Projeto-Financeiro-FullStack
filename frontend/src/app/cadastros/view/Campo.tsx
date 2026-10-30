import { useId, type ComponentProps } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Campo = ({
  label,
  erro,
  ...props
}: ComponentProps<typeof Input> & { label: string; erro?: string }) => {
  const id = useId();
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        {...props}
        id={id}
        aria-invalid={!!erro}
        aria-describedby={erro ? `${id}-erro` : undefined}
      />
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
