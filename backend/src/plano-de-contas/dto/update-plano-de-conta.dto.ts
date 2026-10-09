import { OmitType, PartialType } from '@nestjs/mapped-types';
import { IsBoolean, ValidateIf } from 'class-validator';
import { CreatePlanoDeContaDto } from './create-plano-de-conta.dto';

export class UpdatePlanoDeContaDto extends PartialType(
  OmitType(CreatePlanoDeContaDto, ['contaPaiId'] as const),
  { skipNullProperties: false },
) {
  @ValidateIf((_, value) => value !== undefined)
  @IsBoolean()
  isActive?: boolean;
}
