import { IsInt, Min } from 'class-validator';
import { DataFinanceira } from '../validators/data-financeira.validator';

export class LiquidarContaDto {
  @DataFinanceira() dataPagamento!: string;
  @IsInt() @Min(1) contaBancariaId!: number;
  @IsInt() @Min(1) formaRecebimentoId!: number;
}
