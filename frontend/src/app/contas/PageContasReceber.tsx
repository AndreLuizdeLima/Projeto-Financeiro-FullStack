import { ContasView } from "./view/ContasView";
import { useContasViewModel } from "./view-model/useContasViewModel";

const PageContasReceber = () => (
  <ContasView vm={useContasViewModel("RECEBER")} />
);
export default PageContasReceber;
