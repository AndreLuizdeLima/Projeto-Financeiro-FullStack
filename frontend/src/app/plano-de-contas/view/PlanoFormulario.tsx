import { Campo } from "@/app/cadastros/view/Campo";
import { FormularioAcoes } from "@/app/cadastros/view/FormularioAcoes";
import { SeletorPesquisavel } from "@/components/ui/seletor-pesquisavel";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { tipos, type TipoPlano } from "../model/plano-de-contas";
import { caminho } from "../model/hierarquia";
import type { PlanoDeContasVM } from "../view-model/usePlanoDeContasViewModel";
import { usePlanoFormularioViewModel } from "../view-model/usePlanoFormularioViewModel";
import { NaturezaBadge } from "./NaturezaBadge";

export function PlanoFormulario({ vm }: { vm: PlanoDeContasVM }) {
  const f = usePlanoFormularioViewModel(vm);
  const conta = vm.modal!.conta;
  const no = vm.arvore.nos.find((n) => n.conta.id === conta?.id);
  return (
    <form
      noValidate
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        void f.enviar();
      }}
    >
      {!f.criar && (
        <dl className="grid gap-2 rounded-lg bg-muted p-3 text-sm">
          <div>
            <dt className="font-medium">Código</dt>
            <dd className="break-all">{conta?.codigo}</dd>
          </div>
          <div>
            <dt className="font-medium">Natureza</dt>
            <dd>{conta && <NaturezaBadge natureza={conta.natureza} />}</dd>
          </div>
          <div>
            <dt className="font-medium">Caminho hierárquico</dt>
            <dd className="wrap-break-word">
              {no?.valido
                ? caminho(no)
                : "Hierarquia inconsistente; vínculo não identificado."}
            </dd>
          </div>
          <div>
            <dt className="font-medium">Situação</dt>
            <dd>{conta?.isActive ? "Ativa" : "Inativa"}</dd>
          </div>
        </dl>
      )}
      <Campo
        label="Nome *"
        value={f.nome}
        onChange={(e) => f.setNome(e.target.value)}
        erro={f.erros.nome}
        readOnly={f.leitura}
        disabled={vm.ocupado}
      />
      <div className="flex flex-col gap-2">
        <Label htmlFor="plano-form-tipo">Tipo *</Label>
        <Select
          value={f.tipo}
          onValueChange={(v) => {
            if (v) f.setTipo(v as TipoPlano);
          }}
          disabled={vm.ocupado || f.leitura || conta?.natureza === "SINTETICA"}
        >
          <SelectTrigger id="plano-form-tipo">
            <SelectValue>{tipos[f.tipo]}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {Object.entries(tipos).map(([valor, texto]) => (
              <SelectItem key={valor} value={valor}>
                {texto}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {f.criar ? (
        <>
          <SeletorPesquisavel
            label="Conta pai *"
            value={f.paiId}
            onValueChange={f.alterarPai}
            disabled={vm.ocupado}
            erro={f.erros.pai}
            permitirInativos
            opcoes={vm.pais.map(({ conta: p }) => ({
              id: p.id,
              label: `${p.codigo} · ${p.nome}${p.isActive ? "" : " (inativa)"}`,
              isActive: p.isActive,
            }))}
          />
          <p className="text-sm text-muted-foreground">
            A nova conta será analítica e ativa. O código será gerado ao salvar.
            O tipo pode ser diferente do tipo do pai.
          </p>
        </>
      ) : (
        !f.leitura && (
          <p className="text-sm text-muted-foreground">
            Código, pai e natureza são fixos após o cadastro. Para usar outra
            posição, inative esta conta e cadastre uma nova.
          </p>
        )
      )}
      <FormularioAcoes
        ocupado={vm.ocupado}
        somenteLeitura={f.leitura}
        podeSalvar={f.alterado}
        fechar={vm.fechar}
      />
    </form>
  );
}
