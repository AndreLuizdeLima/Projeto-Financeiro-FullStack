import { IsInt, Matches, Min, ValidateIf } from 'class-validator';
import { DataFinanceira } from '../validators/data-financeira.validator';

export class LiquidarContaDto {
  @DataFinanceira() dataPagamento!: string;
  @IsInt() @Min(1) contaBancariaId!: number;
  @IsInt() @Min(1) formaRecebimentoId!: number;
  @ValidateIf((_o, valor) => valor !== undefined)
  @Matches(/^(?:0|[1-9]\d{0,16})(?:\.\d{1,2})?$/)
  valorTotalEsperado?: string;
}
