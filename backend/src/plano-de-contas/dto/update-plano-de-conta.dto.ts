import { PartialType } from '@nestjs/mapped-types';
import { CreatePlanoDeContaDto } from './create-plano-de-conta.dto';

export class UpdatePlanoDeContaDto extends PartialType(CreatePlanoDeContaDto, {
  skipNullProperties: false,
}) {}
