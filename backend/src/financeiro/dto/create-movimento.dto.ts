import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';
import { OrigemMovimento, TipoMovimento } from '../financeiro.enums';
import { DataFinanceira } from '../validators/data-financeira.validator';

export class CreateMovimentoDto {
  @IsEnum(TipoMovimento) tipo!: TipoMovimento;
  @IsOptional()
  @IsEnum([OrigemMovimento.AVULSA, OrigemMovimento.SALDO_INICIAL])
  origem?: OrigemMovimento.AVULSA | OrigemMovimento.SALDO_INICIAL;
  @IsString() @IsNotEmpty() @MaxLength(255) descricao!: string;
  @Matches(/^(?:0|[1-9]\d{0,16})(?:\.\d{1,2})?$/) valor!: string;
  @DataFinanceira() data!: string;
  @IsOptional() @IsInt() @Min(1) contaOrigemId?: number;
  @IsOptional() @IsInt() @Min(1) contaDestinoId?: number;
  @IsOptional() @IsInt() @Min(1) clienteId?: number;
  @IsOptional() @IsInt() @Min(1) planoDeContaId?: number;
  @IsOptional() @IsInt() @Min(1) centroDeCustoId?: number;
  @IsOptional() @IsInt() @Min(1) formaRecebimentoId?: number;
}
