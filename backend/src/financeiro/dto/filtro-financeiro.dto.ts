import { IsEnum, IsInt, IsOptional, Matches, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';
import {
  OrigemMovimento,
  SituacaoConta,
  TipoConta,
  TipoMovimento,
} from '../financeiro.enums';
import { DataFinanceira } from '../validators/data-financeira.validator';

export class FiltroFinanceiroDto extends PaginationQueryDto {
  @IsOptional() @IsEnum(TipoConta) tipoConta?: TipoConta;
  @IsOptional() @IsEnum(SituacaoConta) situacao?: SituacaoConta;
  @IsOptional() @IsEnum(TipoMovimento) tipo?: TipoMovimento;
  @IsOptional() @IsEnum(OrigemMovimento) origem?: OrigemMovimento;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) clienteId?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) planoDeContaId?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) centroDeCustoId?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) contaBancariaId?: number;
  @IsOptional() @DataFinanceira() dataInicial?: string;
  @IsOptional() @DataFinanceira() dataFinal?: string;
  @IsOptional() @Matches(/^(true|false)$/) vencida?: string;
}
