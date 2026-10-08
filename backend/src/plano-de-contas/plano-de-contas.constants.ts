import { TipoPlanoConta } from './dto/tipo-de-plano.enum';

export const MAX_NIVEIS_PLANO_DE_CONTAS = 10;
export const MAX_TAMANHO_CODIGO_PLANO_DE_CONTAS = 255;

export const CODIGOS_RAIZ: Record<TipoPlanoConta, string> = {
  [TipoPlanoConta.ATIVO]: '1',
  [TipoPlanoConta.PASSIVO]: '2',
  [TipoPlanoConta.RECEITA]: '3',
  [TipoPlanoConta.DESPESA]: '4',
};
