import { ContaCancelarDialog } from "../components/ContaCancelarDialog";
import type { ContasViewModel } from "../view-model/useContasViewModel";
import { ContasFiltros } from "./ContasFiltros";
import { ContaFormularioModal } from "./ContaFormularioModal";
import { ContasTabela } from "./ContasTabela";

export const ContasView = ({ vm }: { vm: ContasViewModel }) => (
  <section className="flex min-w-0 flex-col gap-5 p-4">
    <h1 className="text-2xl font-semibold">{vm.titulo}</h1>
    <ContasFiltros vm={vm} />
    <ContasTabela vm={vm} />
    {vm.confirmacao && (
      <ContaCancelarDialog
        confirmacao={vm.confirmacao}
        cancelando={vm.cancelando}
        fechar={vm.fecharCancelamento}
        confirmar={vm.confirmarCancelamento}
      />
    )}
    {vm.modal && (
      <ContaFormularioModal
        key={`${vm.tipo}-${vm.modal.id ?? "criar"}`}
        tipo={vm.tipo}
        id={vm.modal.id}
        focoRetorno={vm.modal.focoRetorno}
        fechar={vm.fecharModal}
        aoSalvar={vm.contaSalva}
      />
    )}
  </section>
);
