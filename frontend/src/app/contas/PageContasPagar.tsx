import { ContasView } from "./view/ContasView";
import { useContasViewModel } from "./view-model/useContasViewModel";

const PageContasPagar = () => <ContasView vm={useContasViewModel("PAGAR")} />;
export default PageContasPagar;
