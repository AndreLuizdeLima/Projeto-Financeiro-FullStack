import { Badge } from "@/components/ui/badge";
import type { Plano } from "../model/plano-de-contas";

export function NaturezaBadge({ natureza }: { natureza: Plano["natureza"] }) {
  const sintetica = natureza === "SINTETICA";
  return (
    <Badge variant={sintetica ? "outline" : "default"}>
      {sintetica ? "Sintética" : "Analítica"}
    </Badge>
  );
}
