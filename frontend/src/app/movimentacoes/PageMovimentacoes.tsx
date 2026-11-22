import { MovimentacoesView } from "./view/MovimentacoesView";
import { useMovimentacoesViewModel } from "./view-model/useMovimentacoesViewModel";

export default function PageMovimentacoes() {
  const vm = useMovimentacoesViewModel();
  return <MovimentacoesView vm={vm} />;
}
