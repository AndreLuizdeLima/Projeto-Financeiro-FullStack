import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';
import { TipoConta } from '../financeiro.enums';
import { DataFinanceira } from '../validators/data-financeira.validator';

export class CreateContaDto {
  @IsEnum(TipoConta) tipo!: TipoConta;
  @IsString() @IsNotEmpty() @MaxLength(255) descricao!: string;
  @Matches(/^(?:0|[1-9]\d{0,16})(?:\.\d{1,2})?$/) valorOriginal!: string;
  @DataFinanceira() dataEmissao!: string;
  @DataFinanceira() dataVencimento!: string;
  @IsInt() @Min(1) clienteId!: number;
  @IsInt() @Min(1) planoDeContaId!: number;
  @IsOptional() @IsInt() @Min(1) centroDeCustoId?: number | null;
  @ValidateIf((_o, v) => v !== undefined)
  @Matches(/^(?:0|[1-9]\d{0,2})(?:\.\d{1,6})?$/)
  taxaJurosDiaria?: string;
  @ValidateIf((_o, v) => v !== undefined)
  @Matches(/^(?:0|[1-9]\d{0,2})(?:\.\d{1,6})?$/)
  taxaMulta?: string;
}
