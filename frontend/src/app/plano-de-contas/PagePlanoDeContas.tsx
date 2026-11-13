import { PlanoDeContasView } from "./view/PlanoDeContasView";
import { usePlanoDeContasViewModel } from "./view-model/usePlanoDeContasViewModel";
export default function PagePlanoDeContas() {
  const vm = usePlanoDeContasViewModel();
  return <PlanoDeContasView vm={vm} />;
}
