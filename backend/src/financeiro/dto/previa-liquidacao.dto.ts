import { IsOptional } from 'class-validator';
import { DataFinanceira } from '../validators/data-financeira.validator';

export class PreviaLiquidacaoDto {
  @IsOptional() @DataFinanceira() dataPagamento?: string;
}
