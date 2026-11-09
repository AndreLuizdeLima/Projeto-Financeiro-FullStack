import { Button } from "@/components/ui/button";

export function FormularioAcoes({
  ocupado,
  somenteLeitura = false,
  podeSalvar = true,
  fechar,
}: {
  ocupado: boolean;
  somenteLeitura?: boolean;
  podeSalvar?: boolean;
  fechar: () => void;
}) {
  return (
    <footer className="flex justify-end gap-2">
      {!somenteLeitura && (
        <Button type="submit" disabled={ocupado || !podeSalvar}>
          {ocupado ? "Salvando…" : "Salvar"}
        </Button>
      )}
      <Button type="button" variant="outline" disabled={ocupado} onClick={fechar}>
        Fechar
      </Button>
    </footer>
  );
}
